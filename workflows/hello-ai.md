---
description: Initialize new conversations with goal establishment and approval gating
auto_execution_mode: 3
---

# Hello AI - A New Chat Conversation Initialization

## Purpose
This workflow establishes conversation goals, loads critical context files and sets approval gates

##Step 1 - Load Critical Conext
- Set the project working directory
/run context-critical

## Step 2- Load Core Engineering Guides (Always)
These short guides are always relevant and should be loaded for any task.
/run load-core-guides

## Step 3 - Load Task-Specific Guides
- API/server/auth/networking:
  /run load-api-guides
- UI/React/components/hooks:
  /run load-ui-guides

### Step 3: Establish Goal(s)
**AI ACTION REQUIRED**: 
 - Establish the goal of this conversation.

