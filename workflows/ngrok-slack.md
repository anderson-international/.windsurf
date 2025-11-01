---
description: Automated ngrok setup with env update and Slack API instructions
---

# Ngrok Setup Workflow - Implementation Guide

## Overview
This workflow automates the process of starting ngrok, extracting the public URL, updating the `.env` file, and providing clear instructions to manually update the Slack API settings.

## Workflow Steps

### Step 1: Start ngrok Server
**Purpose:** Launch ngrok tunnel on port 3000

**Implementation:**
- Use `run_command` tool with `Blocking: false` and `WaitMsBeforeAsync: 3000`
- Command: `cmd /c ngrok http 3000 --log=stdout`
- Store the command ID for later reference
- This runs in background so workflow can continue

**Expected Output:**
- Background command ID returned
- ngrok process starts listening on port 3000

---

### Step 2: Wait and Extract ngrok URL
**Purpose:** Query ngrok API to get the public tunnel URL

**Implementation:**
- Use `run_command` tool with `Blocking: true`
- Command: `cmd /c curl -s http://localhost:4040/api/tunnels`
- Parse the JSON response to extract `public_url` field
- Expected format: `https://XXXXXXXXXXXXXXXX.ngrok-free.app`

**Parsing Logic:**
```
Response JSON structure:
{
  "tunnels": [
    {
      "public_url": "https://c1db3c7ea863.ngrok-free.app",
      ...
    }
  ]
}
```

**Error Handling:**
- If curl fails or ngrok not responding, wait 2 seconds and retry
- Maximum 3 retry attempts before failing

---

### Step 3: Update .env File
**Purpose:** Update `SLACK_INTERACTIONS_URL` with the new ngrok URL

**Implementation:**
- Use `edit` tool on file: `c:/Users/Jonny/Code/spec-builder/.env`
- Find and replace the `SLACK_INTERACTIONS_URL` line
- Pattern to match: `SLACK_INTERACTIONS_URL=https://.*ngrok.*`
- New value: `SLACK_INTERACTIONS_URL=https://{extracted-url}/api/slack/interactions`
- Important: Include the full path `/api/slack/interactions`

**Example:**
```
OLD: SLACK_INTERACTIONS_URL=https://your-ngrok-url.ngrok.io/api/slack/interactions
NEW: SLACK_INTERACTIONS_URL=https://c1db3c7ea863.ngrok-free.app/api/slack/interactions
```

---

### Step 4: Output Instructions to Chat
**Purpose:** Display clear, formatted instructions for manual Slack API update

**Implementation:**
- Output formatted text to user with the following sections:

#### Section A: Success Message
```
✅ Ngrok is running!
✅ .env file updated!
```

#### Section B: Current ngrok URL
```
Current Ngrok URL: https://c1db3c7ea863.ngrok-free.app
```

#### Section C: Manual Instructions
Provide step-by-step instructions:
1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to "Interactivity & Shortcuts"
4. Find "Request URL" field
5. Clear current value
6. Paste: `https://{ngrok-url}/api/slack/interactions`
7. Click "Save Changes"
8. Wait for Slack to verify (green checkmark)

#### Section D: Important Notes
- Emphasize the `/api/slack/interactions` path is REQUIRED
- Warn that without the full path, requests will get 403 errors
- Note that Slack will verify the URL by sending a test request

#### Section E: Verification
```
Once updated in Slack:
- Slack will send a verification request
- You should see a green checkmark next to the Request URL
- The Submit button in Slack messages will now work correctly
```

---

## Technical Considerations

### Ngrok URL Extraction
- The URL changes each time ngrok starts (unless using paid ngrok account with reserved domain)
- Always extract fresh URL from ngrok API, don't hardcode
- Use the `public_url` field from the first tunnel in the response

### .env File Updates
- Must use exact string matching to avoid replacing wrong lines
- Include full path `/api/slack/interactions` in the URL
- Verify the file was updated by reading it back

### Error Messages
- If ngrok fails to start: "Ngrok failed to start. Check if port 3000 is already in use."
- If URL extraction fails: "Could not extract ngrok URL. Ensure ngrok is running."
- If .env update fails: "Failed to update .env file. Check file permissions."

### User Communication
- Make instructions very clear and easy to follow
- Use numbered steps
- Include the exact URL to copy/paste
- Highlight the importance of the full path
- Provide visual confirmation steps (green checkmark in Slack)

---

## Workflow File Structure

```
---
description: Start ngrok and update Slack API configuration
---

# Ngrok Setup Workflow

## Step 1: Start ngrok
// turbo
Start ngrok server on port 3000

## Step 2: Extract ngrok URL
Query ngrok API to get public tunnel URL

## Step 3: Update .env
Update SLACK_INTERACTIONS_URL with new ngrok URL

## Step 4: Display Instructions
Output formatted instructions to update Slack API admin
```

---

## Testing the Workflow

After implementation, test with:
1. Kill all node processes: `taskkill /F /IM node.exe`
2. Run the workflow
3. Verify .env file was updated correctly
4. Manually update Slack settings
5. Test Slack button click - should work without 403 error

---

## Related Memories
- Reference the "Ngrok URL Update Workflow" memory for context
- Update memory with any new learnings about ngrok/Slack integration

---

## Notes for Implementation
- Use clear variable names (e.g., `ngrokUrl`, `slackRequestUrl`)
- Add comments explaining each step
- Consider adding a "Skip manual update" option for users who want to do it themselves
- Make the instructions copy-paste friendly (provide exact URLs)
