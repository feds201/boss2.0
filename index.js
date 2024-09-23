require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

// Discord bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

// Register slash commands
const commands = [
    {
        name: 'status',
        description: 'Replies with The bot is working properly',
    },
    {
        name: 'fetch_prog_latest',
        description: 'Fetches the latest progress from the Programming group',
    },
    {
        name: 'fetch_design_latest',
        description: 'Fetches the latest progress from the Design group',
    },
    {
        name: 'fetch_marketing_latest',
        description: 'Fetches the latest progress from the Marketing group',
    },
    {
        name: 'fetch_management_latest',
        description: 'Fetches the latest progress from the Management group',
    }
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Start the bot
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(DISCORD_TOKEN);

// Handle interactions (slash commands and buttons)
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'status') {
            // Create an embed message with the bot's status
            const statusEmbed = new EmbedBuilder()
                .setColor('#00FF00') // Green color
                .setTitle('Bot Status')
                .setDescription('🟢 Bot is working properly');

            // Create a button to refresh the status
            const refreshButton = new ButtonBuilder()
                .setCustomId('refresh_status')
                .setLabel('Refresh Status')
                .setStyle(ButtonStyle.Primary); // Correct button style

            const row = new ActionRowBuilder().addComponents(refreshButton);

            // Reply with the embed and button
            await interaction.reply({ embeds: [statusEmbed], components: [row] });
        }
        if (commandName === 'fetch_prog_latest') {
            // Create an embed message with the latest progress from the Programming group
            const progEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Red color
                .setTitle('Programming Group')
                .setDescription('🚧 Work in progress: Implementing new feature');

            await interaction.reply({ embeds: [progEmbed] });
        }
        if (commandName === 'fetch_design_latest') {
            // Create an embed message with the latest progress from the Design group
            const designEmbed = new EmbedBuilder()
                .setColor('#0000FF') // Blue color
                .setTitle('Design Group')
                .setDescription('🎨 Work in progress: Creating new logo');

            await interaction.reply({ embeds: [designEmbed] });
        }
        if (commandName === 'fetch_marketing_latest') {
            // Create an embed message with the latest progress from the Marketing group
            const marketingEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Orange color
                .setTitle('Marketing Group')
                .setDescription('📈 Work in progress: Preparing new campaign');

            await interaction.reply({ embeds: [marketingEmbed] });
        }
        if (commandName === 'fetch_management_latest') {
            // Create an embed message with the latest progress from the Management group
            const managementEmbed = new EmbedBuilder()
                .setColor('#008000') // Green color
                .setTitle('Management Group')
                .setDescription('📋 Work in progress: Planning next meeting');

            await interaction.reply({ embeds: [managementEmbed] });
        }

    } else if (interaction.isButton()) {
        if (interaction.customId === 'refresh_status') {
            // Update the status embed
            const updatedStatusEmbed = new EmbedBuilder()
                .setColor('#00FF00') // Green color
                .setTitle('Bot Status')
                .setDescription('🟢 Bot is working properly');

            await interaction.update({ embeds: [updatedStatusEmbed] });
        }
    }
});

// Express server setup
const app = express();
app.use(bodyParser.json());

app.post('/github-webhook', (req, res) => {
    // Respond to GitHub webhook
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Check the type of event
    if (event === 'push') {
        const repoName = payload.repository.full_name;
        const pusher = payload.pusher.name;
        const commitMessage = payload.head_commit.message;

        const message = `📦 **${repoName}** received a new push by ${pusher}: ${commitMessage}`;

        // Send message to the Discord channel
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send(message);
        }
    } else if (event === 'issues') {
        const action = payload.action;
        const issueTitle = payload.issue.title;
        const repoName = payload.repository.full_name;

        const message = `🐛 **${repoName}** issue **${issueTitle}** has been ${action}.`;

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send(message);
        }
    }

    res.status(200).send('Webhook received');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});