---
description: Global Rules Synchronization
---

## Maintaining GitHub-Accessible Copy of the Global Rules

1. **Dual storage requirement**  
   - All global rule updates must be synchronized to both:  
     - Primary location: `C:\Users\Jonny\.codeium\windsurf\memories\global_rules.md`  
     - Git-tracked copy: `[project_root]\.windsurf\global_rules.md`

2. **Setup for new projects**  
   - If `.windsurf` directory does not exist in the project root:  
     ```cmd
     md .windsurf
     ```
   - If `global_rules.md` does not exist in `.windsurf`:  
     ```cmd
     copy "C:\Users\Jonny\.codeium\windsurf\memories\global_rules.md" ".windsurf\global_rules.md"
     ```

3. **Update procedure**  
   - After any modification to the rules, update both file locations immediately  
   - Ensure both files have identical contents  
   - If contents differ, synchronize by copying the file with the most recent modification date over the other