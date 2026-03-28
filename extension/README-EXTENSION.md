# Dev Reality Dashboard - Chrome Extension

Real-time web usage and tab switching tracker for the Dev Reality Dashboard.

## Features

- **Real-time tracking** - Monitor web usage as you browse
- **Tab switch counting** - Count every tab switch during your work session
- **Site categorization** - Automatically categorize sites as productive, neutral, or unproductive
- **Time tracking** - Track time spent on each website
- **Sync across sessions** - Data persists across browser sessions

## Installation

### Step 1: Enable Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** ON (switch in top right corner)

### Step 2: Load the Extension

1. Click **Load unpacked**
2. Navigate to the `extension` folder in this project
3. Select the folder

### Step 3: Pin the Extension

1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "Dev Reality Dashboard"
3. Click the pin icon to add it to your toolbar

## Usage

### Opening the Popup

Click the extension icon in your Chrome toolbar to see:
- Current productive/unproductive time today
- Total tab switches
- Currently tracked website

### Viewing Full Dashboard

Click **Open Dashboard** in the popup to open the full analytics interface at `http://localhost:3000`

### Resetting Daily Stats

Click **Reset Today's Stats** at the bottom of the popup to clear all tracking data for a fresh start.

## How It Works

### Site Categorization

Sites are automatically categorized based on domain patterns:

**Productive Sites:**
- github.com, gitlab.com, bitbucket.org
- stackoverflow.com
- docs.*, developer.*, api.*
- notion.so, figma.com
- aws.amazon.com, vercel.com, netlify.com

**Unproductive Sites:**
- youtube.com, twitter.com, x.com
- facebook.com, instagram.com, tiktok.com
- reddit.com, netflix.com, twitch.tv
- discord.com, spotify.com

All other sites are marked as **neutral**.

### Data Storage

All tracking data is stored locally using Chrome's `chrome.storage.local` API:
- Tab switch count
- Daily statistics (productive/neutral/unproductive minutes)
- Recent activity log

### Background Script

The `background.js` service worker:
- Listens for tab activation events
- Tracks tab switches and duration
- Updates daily statistics
- Communicates with content scripts

### Content Script

The `content.js` script runs on every page:
- Reports page load/unload events
- Detects page visibility changes
- Sends data to the background script

## File Structure

```
extension/
├── manifest.json    # Extension configuration (Manifest V3)
├── background.js   # Service worker for tracking
├── content.js      # Content script for page events
├── popup/
│   ├── popup.html  # Popup UI
│   └── popup.js    # Popup logic
└── README-EXTENSION.md  # This file
```

## Permissions

The extension requires these permissions:

| Permission | Purpose |
|------------|---------|
| `tabs` | Track which tabs are active and switching |
| `activeTab` | Access information about the current tab |
| `storage` | Save tracking data locally |
| `webNavigation` | Monitor page navigation events |

## Troubleshooting

### Extension Not Loading

1. Make sure Developer mode is enabled
2. Click **Reload** on the extension card
3. Check for any error messages in the console

### Data Not Updating

1. Click the extension icon to refresh
2. Try reloading the page you're on
3. Reset daily stats if needed

### Popup Not Opening

1. Check that the extension is enabled
2. Try pinning the extension to the toolbar
3. Reload the extension

## Privacy

- All data is stored **locally** in your browser
- No data is sent to external servers
- No personal information is collected
- Data can be cleared at any time using Reset

## Updating the Extension

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the **Reload** button on the Dev Reality Dashboard card
