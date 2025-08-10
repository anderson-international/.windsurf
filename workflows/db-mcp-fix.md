---
description: Re-establish the NeonDB MCP connection
---

# Re-establish the NeonDB MCP connection

## Delete the OAuth Cache

**CRITICAL Instruction** : Execute the command below using the exact syntax. Note the lack of quotes around the path.

// turbo
```bash
cmd /c rmdir /s /q %USERPROFILE%\.mcp-auth
```

**AI Instructions**: 
 - After running the rmdir command, check the path does not now exist.
 - Instruct the user to restart the Windsurf IDE and follow the re-authentication prompt

This workflow re-established the connection with the NeonDB MCP