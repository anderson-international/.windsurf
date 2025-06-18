---
description: Bootstrap workflow - Initialize AI with document graph system knowledge
---

# Document Graph System Bootstrap

**🚨 IMPORTANT: Run this workflow at the start of EVERY new AI conversation**

## What This Does

This workflow initializes the AI with knowledge of your intelligent document graph system, enabling it to:
- Proactively suggest relevant documentation workflows
- Analyze files and recommend appropriate context loading
- Understand your project-specific patterns and anti-patterns
- Provide contextually-aware development assistance

## System Initialization

### Load Core AI Context

```
Load: docs/ai/ingestion/ai-coding-handbook.md
```

**Key Context Gained:**
- Your coding standards and validation patterns
- Anti-patterns to avoid
- Code quality requirements

### Load Business Context

```
Load: docs/project/business-context.md
```

**Key Context Gained:**
- Project objectives (Snuff Specification Builder)
- Target users and use cases
- Business constraints and requirements

### Load Document Graph System

```
Load: .windsurf/workflows/getting-started.md
```

**Key Context Gained:**
- How the document graph system works
- Available workflows and their purposes
- Real-world usage scenarios and examples

## Smart Context Loading Capabilities

// turbo
```bash
cmd /c node scripts/smart-context-loader.js --core-context
```

This loads the intelligent context loading system, giving the AI access to:
- Document dependency mapping
- Workflow-specific document collections
- File-type based context suggestions

## Available Workflows After Bootstrap

Once bootstrapped, the AI can proactively suggest these workflows:

### **Development Workflows**
- `/docs-forms` - Form development (React Hook Form, validation, database integration)
- `/docs-api` - API development (authentication, error handling, Shopify integration)
- `/docs-ui` - UI/UX development (component patterns, styling, accessibility)
- `/docs-debug` - Debugging and optimization (React effects, performance, linting)

### **AI Workflows**
- `/docs-ai-reboot` - Quick AI context restoration (30 seconds)
- `/docs-bootstrap` - Full system initialization (this workflow)

### **Quality Workflows**
- `/clean-lint` - Code quality review with iterative fixes
- `/clean-build` - Build review with iterative fixes
- `/system-health-check` - Comprehensive system validation

## AI Behavioral Changes After Bootstrap

### **Before Bootstrap (Generic AI):**
```
You: "I'm working on a form component"
AI: "I can help with forms. What do you need?"
```

### **After Bootstrap (Context-Aware AI):**
```
You: "I'm working on a form component"
AI: "Perfect! Let me load your form development context:"
    /docs-forms
AI: "✅ Form context loaded. I now understand your:
    - React Hook Form patterns
    - Validation strategies  
    - Database integration approach
    - Common pitfalls to avoid
    
    What specific aspect of the form are you working on?"
```

## File Analysis Capabilities

After bootstrap, the AI can analyze your files and suggest appropriate context:

```
You: "Here's my ProductCard.tsx component..."
AI: "I see you're working on a React component. Let me analyze what context would be helpful:"
    
    // AI runs: cmd /c node scripts/context-preloader.js --analyze src/components/ProductCard.tsx
    
AI: "Based on your file, I recommend loading UI development context:"
    /docs-ui
    
    "This will give me access to your component patterns, styling strategies, and performance optimization techniques."
```

## Proactive Health Monitoring

The AI can now proactively maintain system health:

```
AI: "Before we start complex development, let me run a quick system health check:"
    /system-health-check
    
AI: "✅ All systems healthy. Documentation is consistent and workflows are operational."
```

## Usage Instructions

### **For Every New AI Conversation:**

1. **First message:** Run `/docs-bootstrap`
2. **Wait for confirmation:** AI will confirm bootstrap completion
3. **Begin normal development:** AI will now proactively suggest appropriate workflows

### **Example Bootstrap Session:**

```
🧑‍💻 You: "/docs-bootstrap"

🤖 AI: "🚀 Bootstrapping document graph system..."
      [Loads core context, business context, and system knowledge]
      
🤖 AI: "✅ Bootstrap complete! I'm now context-aware and ready to help with:
      
      📋 **Available Workflows:**
      - /docs-forms (Form development)  
      - /docs-api (API development)
      - /docs-ui (UI/UX development)
      - /docs-debug (Debugging & optimization)
      
      🔍 **Smart Capabilities:**
      - File analysis and context suggestions
      - Proactive workflow recommendations
      - System health monitoring
      - Project-specific pattern awareness
      
      What are you working on today?"

🧑‍💻 You: "I need to build a product registration form"

🤖 AI: "Perfect! This involves form development. Let me load the appropriate context:"
      /docs-forms
      
🤖 AI: "✅ Form context loaded. I now understand your React Hook Form patterns, validation strategies, and database integration approach. Let's build that registration form!"
```

## System Health Validation

// turbo
```bash
cmd /c node scripts/graph-analytics.js --health
```

Ensures the document graph system is operational and ready for proactive suggestions.

## Key Benefits After Bootstrap

✅ **Intelligent Context Loading** - AI suggests relevant workflows based on your work  
✅ **Project-Specific Knowledge** - AI understands YOUR patterns and anti-patterns  
✅ **Proactive Assistance** - AI anticipates documentation needs  
✅ **Consistent Experience** - Every conversation starts with full project context  
✅ **Self-Maintaining System** - AI can validate and maintain system health  

---

**🎯 Remember: Run `/docs-bootstrap` at the start of every new AI conversation to unlock the full power of your intelligent document graph system!**
