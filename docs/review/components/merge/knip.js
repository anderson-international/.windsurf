const { toRepoRelative } = require('../utils/paths');

function applyKnipToResults(results, knipData) {
  const byFile = new Map();
  for (const r of results) {
    byFile.set(toRepoRelative(r.filePath), r);
  }

  const summary = {
    unusedFiles: Array.isArray(knipData?.files) ? knipData.files.length : 0,
    unusedExports: 0,
    unusedTypes: 0,
    unusedEnumMembers: 0,
    unusedClassMembers: 0,
    unlistedDependencies: 0,
    unresolvedImports: 0
  };

  const issues = Array.isArray(knipData?.issues) ? knipData.issues : [];
  for (const item of issues) {
    const fileKey = toRepoRelative(item.file || '');
    const counts = {
      unusedExports: Array.isArray(item.exports) ? item.exports.length : 0,
      unusedTypes: Array.isArray(item.types) ? item.types.length : 0,
      unusedEnumMembers: item.enumMembers ? Object.values(item.enumMembers).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
      unusedClassMembers: item.classMembers ? Object.values(item.classMembers).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
      unlistedDependencies: Array.isArray(item.unlisted) ? item.unlisted.length : 0,
      unresolvedImports: Array.isArray(item.unresolved) ? item.unresolved.length : 0
    };

    summary.unusedExports += counts.unusedExports;
    summary.unusedTypes += counts.unusedTypes;
    summary.unusedEnumMembers += counts.unusedEnumMembers;
    summary.unusedClassMembers += counts.unusedClassMembers;
    summary.unlistedDependencies += counts.unlistedDependencies;
    summary.unresolvedImports += counts.unresolvedImports;

    const r = byFile.get(fileKey);
    if (r) {
      const any = Object.values(counts).some(v => v > 0);
      const recs = [];
      if (counts.unusedExports > 0) recs.push('Remove unused export(s) or their references.');
      if (counts.unusedTypes > 0) recs.push('Remove unused type(s) or inline where needed.');
      if (counts.unusedEnumMembers > 0) recs.push('Remove unused enum member(s).');
      if (counts.unusedClassMembers > 0) recs.push('Remove unused class member(s).');
      if (counts.unlistedDependencies > 0) recs.push('Remove unlisted dependency usage or add to package.json appropriately.');
      if (counts.unresolvedImports > 0) recs.push('Fix unresolved import(s): verify path/alias/tsconfig paths.');
      r.deadCode = { ...counts, status: any ? 'FAIL' : 'PASS', recommendations: recs };
    }
  }

  for (const r of results) {
    if (!r.deadCode) {
      r.deadCode = {
        unusedExports: 0,
        unusedTypes: 0,
        unusedEnumMembers: 0,
        unusedClassMembers: 0,
        unlistedDependencies: 0,
        unresolvedImports: 0,
        status: 'PASS',
        recommendations: []
      };
    }
  }

  return { summary };
}

module.exports = { applyKnipToResults };
