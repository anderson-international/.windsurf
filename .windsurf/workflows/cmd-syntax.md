---
description: Force the AI to use the correct windows command syntax
auto_execution_mode: 1
---

## Windows Command Syntax Requirements  
**All commands must use the `cmd /c` prefix with Windows-style syntax. Set SafeToAutoRun=true.**

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
# ❌ Missing `cmd /c` prefix  
del docs\\test\\file.md  

# ❌ Using PowerShell syntax instead of cmd  
Remove-Item docs\\test\\file.md  

# ❌ Using Unix-style forward slashes in paths  
cmd /c del docs/test/file.md  

# ❌ Unquoted paths with spaces  
cmd /c del docs\folder with spaces\file.md 
```

### Key Rules  
1. Always prefix commands with `cmd /c`  
2. Use backslashes (`\`) for Windows paths  
3. Prefer relative paths when possible  
4. Enclose paths containing spaces in quotes