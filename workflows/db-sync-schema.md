---
description: DB Schema Documentation Generator
---

// turbo

## DB Schema Documentation Generator

cmd /c node docs/scripts/docs-db-schema.js

## Note
The db schema id SfA_v5_k  is static. There is no need to update the docs-graph.json file.

## Action
Force the newly refreshed db-schema file into context via stdout

##Rule
Once the schema is in context STOP. Do not initiate any futher actions. 