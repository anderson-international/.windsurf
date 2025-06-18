---
description: AI Documentation Optimisation
---

# AI Documentation Optimization Workflow  

The `@docs` folder contains files designed exclusively for AI models, providing essential context and rules for accurate code generation. These documents must eliminate redundancy, consolidate fragmented information, and maintain up-to-date AI-specific enhancements for optimal ingestion efficiency.  

**Task:**  
Review all files in the `@docs` folder without omission. **CRITICAL: Begin with comprehensive enumeration to prevent systematic oversights.**

## Phase 1: Complete File Enumeration (MANDATORY)
1. **Discover All Directories:**
   - Use `list_dir` to identify ALL subdirectories within `@docs`
   - Document every subdirectory found (e.g., `/guides`, `/concerns`, `/project`, `/pitfalls`, etc.)
   - Add the complete directory list to your working plan

2. **Enumerate All Files:**
   - For each discovered directory, use `list_dir` to identify ALL files
   - Create a comprehensive inventory with exact file counts per directory
   - Add the complete file inventory to your working plan with expected totals

3. **Verification Step:**
   - Cross-reference your enumerated file list against any existing documentation indices
   - Confirm total file count matches discovered files
   - Flag any discrepancies for investigation

## Phase 2: AI Enhancement Audit

During this process:  
- Read the @ai-navigation-template.md file
- Identify duplicate information across files.  
- Detect scattered or fragmented content that could be consolidated.  
- Verify all AI enhancements (e.g., annotations, structured references) are current and preserved.  
- Ensure conciseness without sacrificing intent or critical details.  

**Output:**  
Produce a concise report addressing:  
- Redundant content and opportunities for consolidation.  
- Fragmented information requiring structural reorganization.  
- Specific, actionable suggestions to improve AI ingestion efficiency, such as:  
  - Merging duplicate sections or files.  
  - Restructuring scattered content into centralized references.  
  - Updating/expanding AI annotations for clarity.  
  - Adding metadata or hierarchical indexing for faster navigation.  

**Goal:** Ensure the AI internalizes rules and context with minimal cognitive load, enabling precise and consistent code generation.

## Anti-Pattern Prevention
❌ **NEVER** assume directory structure without explicit enumeration
❌ **NEVER** rely on partial directory listings from previous sessions
✅ **ALWAYS** perform complete file discovery as the first step
✅ **ALWAYS** update your plan with the complete file inventory before proceeding