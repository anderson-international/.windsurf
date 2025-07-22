---
description: Initialize new conversations with goal establishment and approval gating
---

# Hello AI - A New Chat Conversation Initialization

## Purpose
This workflow establishes conversation goals, sets approval gates, and selects appropriate context loaders for efficient AI-assisted development.

## Step 1 - Initialise Command Syntax
/run cmd-syntax
/run critical-context

## Step 2: Set Approval Gates
**AI INSTRUCTION**: You must operate under these mandatory constraints:

### Methodology: Analyze → Report → Seek Approval → Execute
**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time

## Step 3: Establish Goal
**AI ACTION REQUIRED**: Establish the primary goal of this conversation by asking the user. 

## Step 4: Rename Conversation
**AI ACTION REQUIRED**: Based on the established goal, rename this conversation using a title that summarizes the newly established conversation goal.

Format: "Goal: [brief description]"


## Step 5: Load Context
/run auto-context

## Step 6: Load Code Rules
/run code-rules