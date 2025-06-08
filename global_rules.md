## Discussion Guidelines

### Question Approach
When gathering requirements or clarifying preferences:
1. **Ask questions one at a time** - Focus on a single topic to avoid overwhelming discussion
2. **Sub-questions allowed** - Can ask follow-up questions to clarify, but maintain focus
3. **Move forward efficiently** - As soon as sufficient information is gathered, proceed to the next question

### Discussion Documentation
For exploratory design discussions:
1. **Initiation approach** - Hybrid model for starting documentation:
   - AI should proactively recognize exploratory design discussions and suggest documentation
   - User can explicitly request "Let's document this discussion" at any point
   - Documentation should capture full context retrospectively from the beginning of the relevant discussion

2. **Create specialized documents** - When entering exploratory design discussions, create a new markdown document in the /docs/discussions/ folder
3. **Naming convention** - Use descriptive names with date prefixes: `YYYY-MM-DD-discussion-topic.md`
4. **Document structure**:
   - Title and date
   - Context/background
   - Discussion points with timestamps
   - Decisions/conclusions reached
   - Open questions
   - **Next Steps section** (always required)
5. **Continuous updates** - Add to the document as the discussion evolves
6. **Next Steps section** - Every update must terminate with clear next steps including:
   - Your next specific question
   - Your intentions for the conversation direction
   - Any preparation needed for next discussion
7. **Reference past discussions** - Link to previous discussions when continuing a topic
8. **Context preservation** - When the user provides extensive context explanations, proofread them for clarity and save them to the document for future reference

These documents serve as conversation history to maintain context across sessions and evolve ideas throughout the project lifecycle.

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
