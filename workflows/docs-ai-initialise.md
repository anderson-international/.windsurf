---
description: Bootstrap workflow - Initialize AI with document graph system knowledge
---

# Document Graph System Bootstrap

**🚨 IMPORTANT: Run this workflow at the start of EVERY new AI conversation**

## What This Does

This workflow provides comprehensive AI initialization with your intelligent document graph system, enabling it to:
- Proactively suggest relevant documentation workflows
- Analyze files and recommend appropriate context loading
- Understand your project-specific patterns and anti-patterns
- Provide contextually-aware development assistance
- Navigate the documentation priority framework for code review

## System Initialization

### Load AI Navigation Framework

```
Load: docs/ai/ingestion/ai-index.md
```

**Key Context Gained:**
- Document priority framework (Critical/High/Medium/Low)
- File type detection workflow for smart context loading
- AI review workflow steps and compliance checklist
- Navigation pathways for all documentation

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
- User roles (Admin vs Reviewer)
- Scale requirements (20 users, 600+ products)

## Success Indicators

After running this workflow, the AI should be able to:
- ✅ Suggest appropriate `docs-*` workflows based on your file editing patterns
- ✅ Understand your project's technical stack and business requirements  
- ✅ Navigate documentation using the priority framework
- ✅ Provide contextually-aware coding assistance
- ✅ Detect violations using the compliance checklist

## Available Workflows After Bootstrap

Once bootstrapped, the AI can proactively suggest these workflows:

### **Development Workflows**
- `docs-forms` - Form development (React Hook Form, validation, database integration)
- `docs-api` - API development (authentication, error handling, Shopify integration)
- `docs-ui` - UI/UX development (component patterns, styling, accessibility)
- `docs-debug` - Debugging and optimization (React effects, performance, linting)

### **AI Workflows**
- `docs-ai-refresh` - Quick AI context restoration (30 seconds)
- `docs-ai-initialise` - Full system initialization (this workflow)
- `docs-ai-health-check` - System validation and health monitoring

### **Quality Workflows**
- `clean-lint` - Code quality review with iterative fixes
- `clean-build` - Build review with iterative fixes

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
    docs-forms
AI: "✅ Form context loaded. I now understand your:
    - React Hook Form patterns
    - Validation strategies  
    - Database integration approach
    - Common pitfalls to avoid
    
    What specific aspect of the form are you working on?"
```

## Usage Instructions

### **For Every New AI Conversation:**

1. **First message:** Run `docs-ai-initialise`
2. **Wait for confirmation:** AI will confirm bootstrap completion
3. **Begin normal development:** AI will now proactively suggest appropriate workflows

### **Example Bootstrap Session:**

```
🧑‍💻 You: "docs-ai-initialise"

🤖 AI: "🚀 Bootstrapping document graph system..."
      [Loads core context, business context, and system knowledge]
      
🤖 AI: "✅ Bootstrap complete! I'm now context-aware and ready to help with:
      
      📋 **Available Workflows:**
      - docs-forms (Form development)  
      - docs-api (API development)
      - docs-ui (UI/UX development)
      - docs-debug (Debugging & optimization)
      
      🔍 **Smart Capabilities:**
      - File analysis and context suggestions
      - Proactive workflow recommendations
      - System health monitoring
      - Project-specific pattern awareness
      
      What are you working on today?"

🧑‍💻 You: "I need to build a product registration form"

🤖 AI: "Perfect! This involves form development. Let me load the appropriate context:"
      docs-forms
      
🤖 AI: "✅ Form context loaded. I now understand your React Hook Form patterns, validation strategies, and database integration approach. Let's build that registration form!"
```

## Key Benefits After Bootstrap

✅ **Intelligent Context Loading** - AI suggests relevant workflows based on your work  
✅ **Project-Specific Knowledge** - AI understands YOUR patterns and anti-patterns  
✅ **Proactive Assistance** - AI anticipates documentation needs  
✅ **Consistent Experience** - Every conversation starts with full project context  
✅ **Self-Maintaining System** - AI can validate and maintain system health  

---

**🎯 Remember: Run `docs-ai-initialise` at the start of every new AI conversation to unlock the full power of your intelligent document graph system!**

**📊 Comprehensive context coverage for all development scenarios**
