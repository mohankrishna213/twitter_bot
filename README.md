# Twitter Bot

A Twitter bot built using the Twitter API v2 and Model Context Protocol (MCP).

## Features

- Post tweets
- Search recent tweets from specific users
- MCP server integration for AI model interaction

## Prerequisites

- Node.js (v14 or higher)
- Twitter API v2 access token
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Twitter API credentials:
```
BEARER_TOKEN=your_twitter_bearer_token
```

4. Start the server:
```bash
npm start
```

## Project Structure

- `index.ts` - Main server file with MCP configuration
- `tools/` - Directory containing Twitter API tools
  - `postTweet.ts` - Tweet posting functionality
  - `recentSearch.ts` - Recent tweet search functionality

## Usage

The bot provides two main tools:
1. `post_tweet` - Post a new tweet
2. `get_tweets` - Search recent tweets from a specific user

## License

MIT
