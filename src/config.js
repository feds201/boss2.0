require('dotenv').config();

module.exports = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
    GUILD_ID: process.env.GUILD_ID,
    CLIENT_ID: process.env.CLIENT_ID,
    PORT: process.env.PORT || 3000
};