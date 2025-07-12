---
description: Initialize new conversations with goal establishment and approval gating
---

# New Chat Conversation Initialization

## Purpose
This workflow establishes conversation goals, sets approval gates, and selects appropriate context loaders for efficient AI-assisted development.

## Step 1 - Initialise Command Syntax
/run cmd-syntax

## Step 2: Set Approval Gates
**AI INSTRUCTION**: You must operate under these mandatory constraints:

1. **NO CHANGES WITHOUT APPROVAL** - Do not make any code changes, file modifications, or system updates without explicit user approval
2. **ANALYZE AND REPORT FIRST** - Your cycle is: analyze → report findings → seek approval → then act
3. **SEEK PERMISSION** - Before any destructive or irreversible actions, always ask "Should I proceed?"
4. **INCREMENTAL PROGRESS** - Make small, approved changes rather than large modifications

## Step 3: Establish Goal
**AI ACTION REQUIRED**: Establish the primary goal of this conversation by asking the user

## Step 4: Select Appropriate Context Loader

Based on the established goal, determine which workflow(s) to load:

### **Frontend Development Tasks**
- **Forms/Wizards**: Use `/make-wizard` 
- **Authentication**: Use `/make-auth`
- **Navigation**: Use `/make-nav`
- **UI Components**: Use `/make-modal`, `/make-dropdown`, `/make-multiselect`
- **Data Display**: Use `/make-listing`, `/make-filters`

### **Backend Development Tasks**
- **API Endpoints**: Use `/make-endpoint`
- **Search APIs**: Use `/make-search`

### **Database Tasks**
- **Schema Design**: Use `/schema-all`
- **Form Integration**: Use `/schema-wizard`
- **API Integration**: Use `/schema-crud`
- **Authentication**: Use `/schema-auth`

### **Code Quality Tasks**
- **Debugging**: Use `/tech-react-debug`
- **Code Standards**: Use `/tech-code-quality`
- **Advanced Patterns**: Use `/tech-react-advanced`

### **Technology-Specific Tasks**
- **React Forms**: Use `/tech-react-forms`
- **Mobile UI**: Use `/tech-ui-mobile`
- **Validation**: Use `/tech-validation`
- **Database Patterns**: Use `/tech-db-patterns`
- **API Design**: Use `/tech-api-crud`
- **Shopify Integration**: Use `/tech-shopify-integration`

## Step 5: Rename Conversation
**AI ACTION REQUIRED**: Based on the established goal, suggest a concise conversation title that summarizes the objective.

Format: "Goal: [brief description]"

## Step 6: Load Selected Context
**AI ACTION REQUIRED**: After determining the appropriate workflow(s), ask for permission to load the context:

"Based on your goal, I recommend loading the following context: [workflow names]. Should I proceed?"

## Expected Workflow
1. User triggers `/run new-chat`
2. AI loads critical context
3. AI asks for goal clarification
4. AI explains approval constraints
5. AI recommends appropriate context loaders
6. AI suggests conversation rename
7. AI seeks permission to load context
8. AI proceeds only after approval


## Final Step: Load Critical AI Context
/run critical-context
