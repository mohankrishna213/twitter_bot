import got from 'got';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import qs from 'querystring';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
// export CONSUMER_KEY='YOUR-KEY'
// export CONSUMER_SECRET='YOUR-SECRET'
const consumer_key = 'puOQr0w57uX9m4dz5jGRA6Cg8';
const consumer_secret = 'BAuw8fau20MxsrjYIYIIEQCQJ60CcYNNsax1pqNTioKODk0zio';

// if (!consumer_key || !consumer_secret) {
//   throw new Error('CONSUMER_KEY and CONSUMER_SECRET environment variables must be set');
// }

const endpointURL = `https://api.twitter.com/2/tweets`;

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write';
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
const oauth = new OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString: string, key: string) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

// Function to save access token to file
function saveAccessToken(token: { oauth_token: string; oauth_token_secret: string }) {
  const tokenPath = path.join(__dirname, 'twitter_token.json');
  fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
}

// Function to load access token from file
function loadAccessToken(): { oauth_token: string; oauth_token_secret: string } | null {
  const tokenPath = path.join(__dirname, 'twitter_token.json');
  try {
    if (fs.existsSync(tokenPath)) {
      const tokenData = fs.readFileSync(tokenPath, 'utf8');
      return JSON.parse(tokenData);
    }
  } catch (error) {
    console.error('Error loading token:', error);
  }
  return null;
}

async function input(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (out: string) => {
      rl.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const authHeader = oauth.toHeader(oauth.authorize({
    url: requestTokenURL,
    method: 'POST'
  }));

  const req = await got.post(requestTokenURL, {
    headers: {
      Authorization: authHeader["Authorization"]
    }
  });
  if (req.body) {
    const parsedBody = qs.parse(req.body);
    return {
      oauth_token: parsedBody.oauth_token as string,
      oauth_token_secret: parsedBody.oauth_token_secret as string
    };
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function accessToken({
  oauth_token,
  oauth_token_secret
}: {
  oauth_token: string;
  oauth_token_secret: string;
}, verifier: string) {
  const authHeader = oauth.toHeader(oauth.authorize({
    url: accessTokenURL,
    method: 'POST'
  }));
  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
  const req = await got.post(path, {
    headers: {
      Authorization: authHeader["Authorization"]
    }
  });
  if (req.body) {
    const parsedBody = qs.parse(req.body);
    return {
      oauth_token: parsedBody.oauth_token as string,
      oauth_token_secret: parsedBody.oauth_token_secret as string
    };
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function getRequest({
  oauth_token,
  oauth_token_secret
}: {
  oauth_token: string;
  oauth_token_secret: string;
}, tweetText: string) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret
  };

  const authHeader = oauth.toHeader(oauth.authorize({
    url: endpointURL,
    method: 'POST'
  }, token));

  try {
    const req = await got.post(endpointURL, {
      json: { text: tweetText },
      responseType: 'json',
      headers: {
        Authorization: authHeader["Authorization"],
        'user-agent': "v2CreateTweetJS",
        'content-type': "application/json",
        'accept': "application/json"
      }
    });
    
    if (req.body) {
      return req.body;
    } else {
      throw new Error('Unsuccessful request');
    }
  } catch (error: any) {
    console.error('Error posting tweet:', error.response?.body || error.message);
    throw error;
  }
}

export async function postTweet(tweetText: string) {
  try {
    // Try to load existing token
    const savedToken = loadAccessToken();
    
    if (savedToken) {
      console.error('Using saved access token...');
      // Make the request with saved token
      const response = await getRequest(savedToken, tweetText);
      console.error('Tweet response:', JSON.stringify(response, null, 2));
      return response;
    } else {
      // Get request token
      const oAuthRequestToken = await requestToken();
      // Get authorization
      authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);
      console.error('Please go here and authorize:', authorizeURL.href);
      const pin = await input('Paste the PIN here: ');
      // Get the access token
      const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());
      // Save the access token
      saveAccessToken(oAuthAccessToken);
      // Make the request
      const response = await getRequest(oAuthAccessToken, tweetText);
      console.error('Tweet response:', JSON.stringify(response, null, 2));
      return response;
    }
  } catch (e) {
    console.error('Error in postTweet:', e);
    throw e;
  }
}