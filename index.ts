import { postTweet } from './tools/postTweet';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { recentSearch } from './tools/recentSearch';

// Create an MCP server with proper error handling
const server = new McpServer({
  name: "Twitter Bot",
  version: "1.0.0"
});

// Add the tweet posting tool
server.tool("post_tweet",
  { tweetText: z.string() },
  async ({ tweetText }) => {
    try {
      const result = await postTweet(tweetText);
      return {
        content: [{ type: "text", text: "Tweet posted successfully!" }]
      };
    } catch (error: any) {
      // Log to stderr to avoid interfering with JSON-RPC
      console.error('Error posting tweet:', error);
      return {
        content: [{ type: "text", text: `Failed to post tweet: ${error.message || 'Unknown error'}` }]
      };
    }
  }
);

server.tool("get_tweets",
  { user_name: z.string() },
  async ({ user_name }) => {
    try {
      const tweets = await recentSearch(user_name);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(tweets, null, 2)
        }]
      };
    } catch (error: any) {
      console.error('Error fetching tweets:', error);
      return {
        content: [{ 
          type: "text", 
          text: `Failed to fetch tweets: ${error.message || 'Unknown error'}`
        }]
      };
    }
  }
);
// Start the server with proper error handling
const transport = new StdioServerTransport();

// Handle process signals
process.on('SIGINT', () => {
  console.error('Received SIGINT. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM. Shutting down...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

try {
  await server.connect(transport);
  // Don't log success to stdout as it interferes with JSON-RPC
  console.error('Twitter Bot server started successfully');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}