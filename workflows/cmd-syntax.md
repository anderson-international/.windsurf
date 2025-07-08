---
description: Force the AI to use the correct windows command syntax
---

// turbo

## Windows Command Syntax Requirements

**All commands must use `cmd /c` prefix and Windows syntax. Set SafeToAutoRun=true.**

### Correct Examples

```bash
# File operations
cmd /c del docs\test\file.md
cmd /c del "docs\folder with spaces\file.md"
cmd /c copy source.txt dest.txt
cmd /c move old.txt new.txt

# Directory operations
cmd /c mkdir docs\new-folder
cmd /c rmdir docs\test
```

### Common Mistakes

```bash
# ❌ Missing cmd /c prefix
del docs\test\file.md

# ❌ PowerShell syntax
Remove-Item docs\test\file.md

# ❌ Unix-style forward slashes
cmd /c del docs/test/file.md

# ❌ Unquoted paths with spaces
cmd /c del c:\Users\Jonny\Code\specifications\docs\test\file.md
```

### Key Rules

1. Always use `cmd /c` prefix
2. Use backslashes `\` for Windows paths
3. Use relative paths when possible
4. Quote paths containing spaces
