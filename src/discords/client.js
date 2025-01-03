const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('../config');
const commands = require('../commands/commands');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");
    
        await rest.put(`/applications/${config.CLIENT_ID}/guilds/${config.GUILD_ID}/commands`, {
            body: commands
        });
    
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

client.login(config.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = client.channels.cache.get(config.CHANNEL_ID);
    return { channel };
});

module.exports = client;