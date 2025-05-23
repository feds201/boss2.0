// src/client.js
const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN } = require('./config');

// Discord bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// Global state variables
let octokit;
let latestProgrammingCommit = 'No programming commits yet.';

// Initialize the client and octokit
const initClient = async () => {
    client.once('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        const { Octokit } = await import('@octokit/rest');
        octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    });
    
    await client.login(DISCORD_TOKEN);
    return client;
};

module.exports = {
    client,
    initClient,
    getOctokit: () => octokit,
    latestProgrammingCommit,
    setLatestProgrammingCommit: (commit) => {
        latestProgrammingCommit = commit;
    },
    getLatestProgrammingCommit: () => latestProgrammingCommit
};
