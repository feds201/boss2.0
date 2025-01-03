const client = require('src/discord/client');
const config = require('src/config');

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = client.channels.cache.get(config.CHANNEL_ID);
    return { channel };
});

