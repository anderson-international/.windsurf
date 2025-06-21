---
description: Complete cognitive load optimization cycle for all documents
---

# Cognitive Load Optimization Workflow

This workflow runs the complete AI-powered optimization cycle to reduce cognitive load scores across all documentation files.

## Single Command Optimization

// turbo
cmd /c node docs\scripts\docs-cog-optimize.js

## What This Does

1. **Scans all docs files** - Finds every markdown file in the docs directory
2. **Measures cognitive load** - Calculates CLS scores for all documents  
3. **Identifies high-CLS files** - Shows documents with CLS > 58 that need optimization
4. **Interactive optimization** - For each high-CLS document:
   - Displays current scores (readability, lexical, coherence)
   - Shows specific AI improvement recommendations
   - Asks permission: "Apply AI improvements? (y/n/skip)"
   - Automatically implements improvements using AI text processing
   - Re-measures and shows before/after scores
5. **Reports results** - Shows final optimization results and improvements

## AI Improvements Applied

- **Sentence Structure**: Breaks down complex sentences, converts passive to active voice
- **Vocabulary**: Replaces technical jargon with simpler alternatives where appropriate  
- **Document Flow**: Improves structure, adds transitions, optimizes lists and headings

## Target Goals

- Reduce all documents to CLS ≤ 58 (optimal cognitive load range)
- Preserve essential information and technical accuracy
- Maintain document usefulness while improving readability

The workflow stops when all documents are optimized or you choose to stop.