// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = 'YOUR_BEARER_TOKEN';

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

async function getRequest(user_name: string) {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const params = {
                'query': `from:${user_name}`,
                'tweet.fields': 'created_at',
                'expansions': 'author_id',
                'user.fields': 'description',
            }

            const res = await needle('get', endpointUrl, params, {
                headers: {
                    "User-Agent": "v2RecentSearchJS",
                    "authorization": `Bearer ${token}`
                }
            });

            if (res.statusCode === 429) {
                console.log(`Rate limit hit. Attempt ${attempt} of ${maxRetries}. Waiting ${retryDelay/1000} seconds...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }

            if (res.body) {
                return res.body;
            } else {
                throw new Error('Unsuccessful request');
            }
        } catch (e) {
            if (attempt === maxRetries) {
                throw e;
            }
            console.log(`Error on attempt ${attempt}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

export async function recentSearch(user_name: string) {
    try {
        // Make request
        const response = await getRequest(user_name);
        return response;
    } catch (e) {
        console.error('Error in recentSearch:', e);
        throw e; // Propagate error to caller
    }
}
