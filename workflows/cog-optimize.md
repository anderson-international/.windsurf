---
description: Complete cognitive load optimization cycle for all documents
---

# Complete Cognitive Load Optimization Cycle

This workflow performs a complete optimization cycle for all documents exceeding the 58 CLS threshold.

## Steps

1. **Analyze current project cognitive load status**
// turbo
```bash
cmd /c node docs/ai/maintenance/scripts/cog-load-measure.js --all
```

2. **Generate improvement recommendations for all high CLS documents**
// turbo  
```bash
cmd /c node docs/ai/maintenance/scripts/cog-load-improve.js --batch-high-cls
```

3. **Apply improvement recommendations to prioritized documents**
Based on the stdout output from step 2, apply the specific improvement strategies to documents with CLS >58, prioritizing:
- Critical documents (>65 CLS) first
- Primary driver improvements (readability, lexical, coherence)
- Sentence simplification and structure improvements
- Stop optimization when documents reach 55-58 CLS target range

4. **Update document graph with optimized CLS values**
// turbo
```bash
cmd /c node docs/ai/maintenance/scripts/cog-load-measure.js --update-graph
```

5. **Verify optimization results**
// turbo
```bash
cmd /c node docs/ai/maintenance/scripts/cog-load-measure.js --all
```

## Usage

Run this workflow to execute a complete cognitive load optimization cycle. The workflow will:
- Assess current CLS scores for all documents
- Generate detailed improvement strategies for documents >58 CLS
- **Apply the recommended improvements to the actual documents**  
- Update the document graph with new CLS values
- Verify the optimization results

This creates a complete optimization loop that actually improves the documents rather than just providing recommendations.
