#!/usr/bin/env node

/**
 * Schema Query Tool
 *
 * Size-aware, paginated database schema query tool that outputs structured
 * information to stdout for AI models to use when planning database interactions
 * and generating CRUD forms.
 *
 * Respects 7,800 byte output limit with automatic pagination.
 */

const { Client } = require('pg')
require('dotenv').config({ quiet: true })

// Configuration
const MAX_OUTPUT_BYTES = 7800
const ITEMS_PER_PAGE = 10

class SchemaQueryTool {
  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    this.connected = false
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect()
      this.connected = true
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.client.end()
      this.connected = false
    }
  }

  async getAllTables() {
    const query = `
      SELECT 
        t.table_name,
        t.table_type,
        obj_description(c.oid) as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name;
    `

    const result = await this.client.query(query)
    return result.rows
  }

  async getTableData(tableName) {
    const [columns, constraints, indexes] = await Promise.all([
      this.getTableColumns(tableName),
      this.getTableConstraints(tableName),
      this.getTableIndexes(tableName),
    ])

    return {
      tableName,
      columns,
      constraints,
      indexes,
      enumValues: tableName.startsWith('enum_') ? await this.getEnumValues(tableName) : [],
    }
  }

  async getTableColumns(tableName) {
    const query = `
      SELECT 
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.is_nullable,
        c.column_default,
        c.ordinal_position,
        col_description(pgc.oid, c.ordinal_position) as column_comment
      FROM information_schema.columns c
      LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
      WHERE c.table_schema = 'public'
      AND c.table_name = $1
      ORDER BY c.ordinal_position;
    `

    const result = await this.client.query(query, [tableName])
    return result.rows
  }

  async getTableConstraints(tableName) {
    const query = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.check_constraints cc
        ON cc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = $1
      ORDER BY tc.constraint_type;
    `

    const result = await this.client.query(query, [tableName])
    return result.rows
  }

  async getTableIndexes(tableName) {
    const query = `
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = $1
      ORDER BY indexname;
    `

    const result = await this.client.query(query, [tableName])
    return result.rows
  }

  async getEnumValues(tableName) {
    try {
      const query = `SELECT id, name FROM ${tableName} ORDER BY id`
      const result = await this.client.query(query)
      return result.rows
    } catch (error) {
      throw new Error(`Failed to fetch enum values from table '${tableName}': ${error.message}`)
    }
  }

  generateIndex(tables) {
    const enumTables = tables.filter((t) => t.table_name.includes('_enum_'))
    const junctionTables = tables.filter((t) => t.table_name.startsWith('spec_junction_'))
    const coreTables = tables.filter(
      (t) => !t.table_name.includes('_enum_') && !t.table_name.startsWith('spec_junction_')
    )

    const enumPages = Math.ceil(enumTables.length / ITEMS_PER_PAGE)
    const junctionPages = Math.ceil(junctionTables.length / ITEMS_PER_PAGE)

    let output = `# Database Schema Index

## Available Tables

### Core Tables (${coreTables.length} tables)
${coreTables.map((t) => `- **${t.table_name}** → Use: --table ${t.table_name}`).join('\n')}

### Enum Tables (${enumTables.length} tables, ${enumPages} pages)
${
  enumPages > 1
    ? Array.from(
        { length: enumPages },
        (_, i) =>
          `- Page ${i + 1}: --enums --page ${i + 1} (${Math.min(ITEMS_PER_PAGE, enumTables.length - i * ITEMS_PER_PAGE)} tables)`
      ).join('\n')
    : '- All tables: --enums --page 1'
}

### Junction Tables (${junctionTables.length} tables)
${
  junctionTables.length <= ITEMS_PER_PAGE
    ? '- All tables: --pattern "spec_junction_*"'
    : `- ${junctionPages} pages available: --pattern "spec_junction_*" --page 1`
}

## Usage Examples

### Load specific table with full details:
\`\`\`bash
cmd /c node docs/scripts/schema-query.js --table specifications
\`\`\`

### Load enum tables (paginated):
\`\`\`bash
cmd /c node docs/scripts/schema-query.js --enums --page 1
\`\`\`

### Load tables by pattern:
\`\`\`bash
cmd /c node docs/scripts/schema-query.js --pattern "*_enum_*" --page 1
\`\`\`

## AI Instructions
Based on your current task, run the appropriate commands above to load the schema information you need.
Each command respects the 7,800 byte output limit and provides navigation for additional pages if needed.

## Size Information
- Individual table queries: 500-3000 bytes each
- Enum page queries: 1000-2000 bytes each
`

    return output
  }

  generateTableDocumentation(tableData) {
    const { tableName, columns, constraints, indexes, enumValues } = tableData

    let doc = `# Table: ${tableName}\n\n`

    // Add table purpose and form guidance
    if (tableName === 'specifications') {
      doc += `**Purpose:** Core specification data - main CRUD operations focus here\n`
      doc += `**Form:** Multi-step wizard (product selection, ratings, text review, enum selections)\n`
      doc += `**Workflow:** Published ↔ Needs Revision\n\n`
    } else if (tableName.startsWith('enum_')) {
      doc += `**Purpose:** Enum table - dropdown/select options\n`
      doc += `**Form:** Dropdown/select options | **Validation:** Required field, foreign key constraint\n`
      if (enumValues.length > 0) {
        const valueMap = enumValues.reduce((acc, row) => {
          acc[row.id] = row.name
          return acc
        }, {})
        doc += `**Values:** ${JSON.stringify(valueMap)}\n`
      }
      doc += `\n`
    } else if (tableName.startsWith('spec_')) {
      doc += `**Purpose:** Junction table - handle as multi-select in forms\n`
      doc += `**Form:** Multi-select checkboxes or tags\n\n`
    }

    // Add columns
    doc += `**Columns:**\n`
    columns.forEach((column) => {
      const nullable = column.is_nullable === 'YES' ? '' : ' *required*'
      const aiHints = this.generateColumnAIHints(tableName, column, constraints)

      let line = `- **${column.column_name}**: ${column.data_type.toUpperCase()}${nullable}`

      if (aiHints.length > 0) {
        line += ` - ${aiHints.join(', ')}`
      }

      doc += line + '\n'
    })

    doc += `\n`

    // Add relationships
    const foreignKeys = constraints.filter((c) => c.constraint_type === 'FOREIGN KEY')
    if (foreignKeys.length > 0) {
      doc += `**Relationships:**\n`
      foreignKeys.forEach((fk) => {
        doc += `- ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name} (constraint: ${fk.constraint_name})\n`
      })
      doc += `\n`
    }

    // Add indexes
    const tableIndexes = indexes.filter((i) => !i.indexname.endsWith('_pkey'))
    if (tableIndexes.length > 0) {
      doc += `**Indexes:**\n`
      tableIndexes.forEach((idx) => {
        const indexType = idx.indexdef.includes('UNIQUE') ? 'UNIQUE' : 'STANDARD'
        const columns = idx.indexdef.match(/\(([^)]+)\)/)?.[1] || 'unknown'
        doc += `- **${idx.indexname}**: ${indexType} on (${columns})\n`
      })
      doc += `\n`
    }

    return doc
  }

  generateColumnAIHints(tableName, column, constraints) {
    const hints = []

    // Foreign key hints
    const fkConstraint = constraints.find(
      (c) => c.constraint_type === 'FOREIGN KEY' && c.column_name === column.column_name
    )
    if (fkConstraint) {
      if (fkConstraint.foreign_table_name.startsWith('enum_')) {
        hints.push(`FORM: dropdown from ${fkConstraint.foreign_table_name}`)
      } else {
        hints.push(`FK: ${fkConstraint.foreign_table_name}.${fkConstraint.foreign_column_name}`)
      }
    }

    // Required field hints
    if (column.is_nullable === 'NO' && !column.column_default) {
      hints.push('REQUIRED')
    }

    // Special field hints
    if (column.column_name === 'star_rating') {
      hints.push('FORM: 1-5 star rating input')
    } else if (column.column_name === 'review') {
      hints.push('FORM: textarea for long text')
    } else if (column.column_name === 'email') {
      hints.push('FORM: email input with validation')
    } else if (column.column_name.includes('boolean') || column.data_type === 'boolean') {
      hints.push('FORM: checkbox or toggle')
    }

    return hints
  }

  validateOutputSize(output) {
    const size = Buffer.byteLength(output, 'utf8')
    if (size > MAX_OUTPUT_BYTES) {
      throw new Error(`Output size ${size} bytes exceeds limit of ${MAX_OUTPUT_BYTES} bytes`)
    }
    return size
  }

  async queryIndex() {
    await this.connect()
    const tables = await this.getAllTables()
    const output = this.generateIndex(tables)
    this.validateOutputSize(output)
    return output
  }

  async queryTable(tableName) {
    await this.connect()
    const tableData = await this.getTableData(tableName)
    const output = this.generateTableDocumentation(tableData)
    this.validateOutputSize(output)
    return output
  }

  async queryEnums(page = 1) {
    await this.connect()
    const allTables = await this.getAllTables()
    const enumTables = allTables.filter((t) => t.table_name.includes('_enum_'))

    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const pageEnums = enumTables.slice(startIndex, endIndex)

    const totalPages = Math.ceil(enumTables.length / ITEMS_PER_PAGE)

    let output = `# Enum Tables - Page ${page} of ${totalPages}\n\n`

    for (const table of pageEnums) {
      const tableData = await this.getTableData(table.table_name)
      output += this.generateTableDocumentation(tableData) + '\n'
    }

    // Add navigation only if there are multiple pages
    if (totalPages > 1) {
      if (page < totalPages) {
        // Action required - more data to load
        output += `\n⚠️ **AI ACTION REQUIRED**: This output was truncated due to size limits.\n`
        output += `**Execute immediately**: cmd /c node docs/scripts/schema-query.js --enums --page ${page + 1}\n`
      } else if (page > 1) {
        // Final page - just reference to previous
        output += `\n**Previous page**: cmd /c node docs/scripts/schema-query.js --enums --page ${page - 1}\n`
      }
    }

    this.validateOutputSize(output)
    return output
  }

  async queryJunctions(page = 1) {
    await this.connect()
    const allTables = await this.getAllTables()
    const junctionTables = allTables.filter((t) => t.table_name.startsWith('spec_junction_'))

    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const pageJunctions = junctionTables.slice(startIndex, endIndex)

    const totalPages = Math.ceil(junctionTables.length / ITEMS_PER_PAGE)

    let output = `# Junction Tables - Page ${page} of ${totalPages}\n\n`

    for (const table of pageJunctions) {
      const tableData = await this.getTableData(table.table_name)
      output += this.generateTableDocumentation(tableData) + '\n'
    }

    // Add navigation only if there are multiple pages
    if (totalPages > 1) {
      if (page < totalPages) {
        // Action required - more data to load
        output += `\n⚠️ **AI ACTION REQUIRED**: This output was truncated due to size limits.\n`
        output += `**Execute immediately**: cmd /c node docs/scripts/schema-query.js --junctions --page ${page + 1}\n`
      } else if (page > 1) {
        // Final page - just reference to previous
        output += `\n**Previous page**: cmd /c node docs/scripts/schema-query.js --junctions --page ${page - 1}\n`
      }
    }

    this.validateOutputSize(output)
    return output
  }

  async queryPattern(pattern, page = 1) {
    await this.connect()
    const allTables = await this.getAllTables()
    const matchingTables = allTables.filter((t) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(t.table_name)
      }
      return t.table_name.includes(pattern)
    })

    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const pageTables = matchingTables.slice(startIndex, endIndex)

    const totalPages = Math.ceil(matchingTables.length / ITEMS_PER_PAGE)

    let output = `# Tables matching "${pattern}" - Page ${page} of ${totalPages}\n\n`

    for (const table of pageTables) {
      const tableData = await this.getTableData(table.table_name)
      output += this.generateTableDocumentation(tableData) + '\n'
    }

    // Add navigation only if there are multiple pages
    if (totalPages > 1) {
      if (page < totalPages) {
        // Action required - more data to load
        output += `\n⚠️ **AI ACTION REQUIRED**: This output was truncated due to size limits.\n`
        output += `**Execute immediately**: cmd /c node docs/scripts/schema-query.js --pattern "${pattern}" --page ${page + 1}\n`
      } else if (page > 1) {
        // Final page - just reference to previous
        output += `\n**Previous page**: cmd /c node docs/scripts/schema-query.js --pattern "${pattern}" --page ${page - 1}\n`
      }
    }

    this.validateOutputSize(output)
    return output
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const tool = new SchemaQueryTool()

  try {
    let output = ''

    if (args.includes('--index')) {
      output = await tool.queryIndex()
    } else if (args.includes('--table')) {
      const tableIndex = args.indexOf('--table')
      const tableName = args[tableIndex + 1]
      if (!tableName) {
        throw new Error('--table requires a table name')
      }
      output = await tool.queryTable(tableName)
    } else if (args.includes('--enums')) {
      const pageIndex = args.indexOf('--page')
      const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) || 1 : 1
      output = await tool.queryEnums(page)
    } else if (args.includes('--junctions')) {
      const pageIndex = args.indexOf('--page')
      const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) || 1 : 1
      output = await tool.queryJunctions(page)
    } else if (args.includes('--pattern')) {
      const patternIndex = args.indexOf('--pattern')
      const pattern = args[patternIndex + 1]
      const pageIndex = args.indexOf('--page')
      const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) || 1 : 1
      if (!pattern) {
        throw new Error('--pattern requires a pattern string')
      }
      output = await tool.queryPattern(pattern, page)
    } else {
      // Default to index
      output = await tool.queryIndex()
    }

    console.log(output)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  } finally {
    await tool.disconnect()
  }
}

function showUsage() {
  console.log(`
Schema Query Tool - Size-aware database schema information

Usage: node schema-query.js [options]

Options:
  --index              Show table index and navigation (default)
  --table <name>       Show detailed information for specific table
  --enums [--page N]   Show enum tables (paginated)
  --junctions [--page N] Show junction tables (paginated)
  --pattern <pattern>  Show tables matching pattern (supports *)
  --page <N>           Page number for paginated results

Examples:
  node schema-query.js --index
  node schema-query.js --table specifications
  node schema-query.js --enums --page 1
  node schema-query.js --junctions --page 1
  node schema-query.js --pattern "*_enum_*"
  node schema-query.js --pattern "spec_junction_*" --page 1

Output limit: ${MAX_OUTPUT_BYTES} bytes (auto-paginated)
`)
}

if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage()
  } else {
    main()
  }
}

module.exports = { SchemaQueryTool }
