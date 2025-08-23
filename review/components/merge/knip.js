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

  const details = {
    unresolvedImports: [], // { file, specifiers: string[] }
    unlistedDependencies: [], // { file, modules: string[] }
    unusedFiles: [], // string[] repo-relative paths
    unusedExports: [], // { file, names: string[] }
    unusedTypes: [], // { file, names: string[] }
    unusedEnumMembers: [], // { file, enums: Array<{ enum, members: string[] }> }
    unusedClassMembers: [] // { file, classes: Array<{ class, members: string[] }> }
  };

  const issues = Array.isArray(knipData?.issues) ? knipData.issues : [];

  // Collect repo-level unused files details if available
  if (Array.isArray(knipData?.files)) {
    for (const f of knipData.files) {
      const rel = toRepoRelative(typeof f === 'string' ? f : (f && f.file) ? f.file : String(f || ''));
      if (rel) details.unusedFiles.push(rel);
    }
  }
  const toName = (e) => {
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object') {
      if ('name' in e && typeof e.name === 'string') return e.name;
      if ('symbol' in e && typeof e.symbol === 'string') return e.symbol;
      try { return JSON.stringify(e); } catch (_) { return String(e); }
    }
    return String(e);
  };

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
      // Attach raw unresolved/unlisted lists for AI to act without rerunning knip
      const unresolvedListRaw = Array.isArray(item.unresolved) ? item.unresolved.slice() : [];
      const unresolvedList = unresolvedListRaw.map(u => (u && typeof u === 'object' && 'name' in u) ? u.name : String(u));
      const unlistedList = Array.isArray(item.unlisted) ? item.unlisted.slice() : [];

      // Build per-file deadCode with conditional details
      const dc = {
        ...counts,
        status: any ? 'FAIL' : 'PASS',
        recommendations: recs
      };
      if (counts.unresolvedImports > 0) dc.unresolvedImportSpecifiers = unresolvedList;
      if (counts.unlistedDependencies > 0) dc.unlistedDependencyModules = unlistedList;
      if (counts.unusedExports > 0) dc.unusedExportNames = Array.isArray(item.exports) ? item.exports.map(toName) : [];
      if (counts.unusedTypes > 0) dc.unusedTypeNames = Array.isArray(item.types) ? item.types.map(toName) : [];
      if (counts.unusedEnumMembers > 0 && item.enumMembers) {
        const enums = Object.entries(item.enumMembers).map(([enm, members]) => ({ enum: enm, members: Array.isArray(members) ? members.map(toName) : [] }));
        dc.unusedEnumMemberNames = enums.filter(e => e.members.length > 0);
      }
      if (counts.unusedClassMembers > 0 && item.classMembers) {
        const classes = Object.entries(item.classMembers).map(([cls, members]) => ({ class: cls, members: Array.isArray(members) ? members.map(toName) : [] }));
        dc.unusedClassMemberNames = classes.filter(c => c.members.length > 0);
      }

      r.deadCode = dc;

    }

    // Always record repo-level details, even if the file wasn't part of the per-file result set
    if (Array.isArray(item.unresolved) && item.unresolved.length > 0) {
      const unresolvedList = item.unresolved.map(u => (u && typeof u === 'object' && 'name' in u) ? u.name : String(u));
      details.unresolvedImports.push({ file: fileKey, specifiers: unresolvedList });
    }
    if (Array.isArray(item.unlisted) && item.unlisted.length > 0) {
      details.unlistedDependencies.push({ file: fileKey, modules: item.unlisted.slice() });
    }
    if (Array.isArray(item.exports) && item.exports.length > 0) {
      const names = item.exports.map(toName);
      details.unusedExports.push({ file: fileKey, names });
    }
    if (Array.isArray(item.types) && item.types.length > 0) {
      const names = item.types.map(toName);
      details.unusedTypes.push({ file: fileKey, names });
    }
    if (item.enumMembers && typeof item.enumMembers === 'object') {
      const enums = Object.entries(item.enumMembers).map(([enm, members]) => ({ enum: enm, members: Array.isArray(members) ? members.map(toName) : [] }));
      const filtered = enums.filter(e => e.members.length > 0);
      if (filtered.length > 0) details.unusedEnumMembers.push({ file: fileKey, enums: filtered });
    }
    if (item.classMembers && typeof item.classMembers === 'object') {
      const classes = Object.entries(item.classMembers).map(([cls, members]) => ({ class: cls, members: Array.isArray(members) ? members.map(toName) : [] }));
      const filtered = classes.filter(c => c.members.length > 0);
      if (filtered.length > 0) details.unusedClassMembers.push({ file: fileKey, classes: filtered });
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
        // also provide arrays for consistency even when empty
        unresolvedImportSpecifiers: [],
        unlistedDependencyModules: [],
        status: 'PASS',
        recommendations: []
      };
    }
  }

  return { summary, details };
}

module.exports = { applyKnipToResults };
