// src/config.js
require('dotenv').config();
const fs = require('fs');

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TBA_API_KEY = process.env.TBA_API_KEY || 'your_tba_api_key';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your_gemini_api_key';

// Credentials management
const credsFilePath = './creds.json';
let credentials = {};

// Load credentials from JSON file
if (fs.existsSync(credsFilePath)) {
    const credsData = fs.readFileSync(credsFilePath);
    credentials = JSON.parse(credsData);
} else {
    credentials = { latestStableCommit: 'No stable commit set.' };
    // Create initial credentials file
    fs.writeFileSync(credsFilePath, JSON.stringify(credentials, null, 2));
}

// Function to update credentials
const updateCredentials = (newData) => {
    credentials = { ...credentials, ...newData };
    fs.writeFileSync(credsFilePath, JSON.stringify(credentials, null, 2));
    return credentials;
};

module.exports = {
    DISCORD_TOKEN,
    CHANNEL_ID,
    GUILD_ID,
    CLIENT_ID,
    GITHUB_TOKEN,
    TBA_API_KEY,
    GEMINI_API_KEY,
    credentials,
    updateCredentials
};
