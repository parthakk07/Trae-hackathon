# Dev Reality Dashboard

A developer analytics platform that tracks productivity, coding patterns, and mood. Combines procrastination tracking, GitHub growth visualization, and code mood detection in a clean, minimal interface.

## Features

- **Overview Dashboard** - At-a-glance view of your daily productivity metrics
- **Productivity Tracker** - Track time spent on different activities, tab switches, and web usage
- **GitHub Growth** - Visualize contributions, streaks, and repository activity
- **Mood Detector** - Analyze coding mood from commit messages
- **Time Analysis** - Understand your coding patterns with hourly/daily breakdowns
- **Chrome Extension** - Track web usage and tab switches in real-time

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dev-reality-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Connecting GitHub

The dashboard can fetch your real GitHub contribution data:

1. Click **Connect GitHub** in the header or settings
2. Enter your GitHub username
3. (Optional) Enter a Personal Access Token for private repository access

Without a token, the dashboard will show simulated data. With a token, you'll see your real contributions.

### Generating a GitHub Personal Access Token

1. Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Grant these scopes:
   - `repo` (for private repos)
   - `read:user` (for profile data)
   - `public_repo` (for public repos)
4. Copy the token and paste it in the dashboard

## Chrome Extension Setup

The Chrome extension tracks your web usage and tab switches in real-time.

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project

### Using the Extension

1. Click the extension icon in Chrome toolbar
2. View real-time stats:
   - Productive vs unproductive time
   - Tab switch count
   - Current site being tracked

3. Click **Open Dashboard** to view full analytics

### Extension Permissions

- `tabs` - Track active tab changes
- `activeTab` - Access current tab information
- `storage` - Store tracking data locally
- `webNavigation` - Monitor navigation events

## Project Structure

```
dev-reality-dashboard/
├── app/
│   ├── components/
│   │   ├── Header/          # Top navigation bar
│   │   ├── Sidebar/         # Side navigation
│   │   ├── Overview/        # Main dashboard view
│   │   ├── Productivity/    # Time tracking
│   │   ├── GitHubGrowth/    # GitHub visualizations
│   │   ├── MoodDetector/    # Commit mood analysis
│   │   ├── TimeAnalysis/    # Pattern analytics
│   │   └── ui/             # Shared UI components
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── utils.ts             # Utility functions
│   ├── ThemeContext.tsx     # Theme provider
│   └── github.ts            # GitHub API integration
├── extension/
│   ├── manifest.json        # Extension manifest
│   ├── background.js        # Service worker
│   ├── content.js           # Content script
│   └── popup/               # Extension popup UI
└── package.json
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS Variables
- **Charts**: Recharts
- **Icons**: Lucide React

## Data Privacy

- All data is stored locally in your browser (localStorage)
- GitHub tokens are never sent to any server
- The Chrome extension stores all tracking data locally
- No external analytics or tracking

## License

MIT
