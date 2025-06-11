## Discussion Guidelines

### Question Approach
When gathering requirements or clarifying preferences:
1. **Ask questions one at a time** - Focus on a single topic to avoid overwhelming discussion
2. **Sub-questions allowed** - Can ask follow-up questions to clarify, but maintain focus
3. **Move forward efficiently** - As soon as sufficient information is gathered, proceed to the next question

## Rule Synchronization

### Maintaining GitHub-Accessible Copy
1. **Dual storage requirement** - All rule updates must be synchronized to both:
   - Primary location: `C:\Users\Jonny\.codeium\windsurf\memories\global_rules.md`
   - Git-tracked copy: `[project_root]\.windsurf\global_rules.md`

2. **Setup for new projects**:
   - Check if `.windsurf` directory exists in the project root, if not:
     ```cmd
     md .windsurf
     ```
   - Check if `global_rules.md` exists in the `.windsurf` directory, if not:
     ```cmd
     copy "C:\Users\Jonny\.codeium\windsurf\memories\global_rules.md" ".windsurf\global_rules.md"
     ```

3. **Update procedure**:
   - When rules are modified, update both copies immediately
   - Verify contents match exactly between both files
   - Remind the user to commit the changes to GitHub when appropriate

## Fundamental User Preferences

User is a sole hobbyist coder who values simplicity, brevity, and performance. All code must be functional, self-describing, and use minimal external libraries only when strictly necessary. Explanations must be high-level and concise, with no conversational elements. Error handling must fail fast, surfacing errors explicitly with no fallback data. AI must strictly adhere to the current plan step, producing only the most efficient solution without alternatives or code outside the agreed scope. Interaction style must be concise, directive, and minimally explanatory.
