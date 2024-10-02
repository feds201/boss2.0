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

let latestProgrammingCommit = 'No programming commits yet.'; // Store the latest programming commit

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

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(DISCORD_TOKEN);

// Handle interactions (slash commands and buttons)
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'status') {
            const statusEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Bot Status')
                .setDescription('🟢 Bot is working properly');

            const refreshButton = new ButtonBuilder()
                .setCustomId('refresh_status')
                .setLabel('Refresh Status')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(refreshButton);

            await interaction.reply({ embeds: [statusEmbed], components: [row] });
        }
        if (commandName === 'fetch_prog_latest') {
            const progEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Programming Group')
                .setDescription(`🚧 Latest progress: ${latestProgrammingCommit}`);

            await interaction.reply({ embeds: [progEmbed] });
        }
        // Other fetch commands...
    }
    else if (interaction.isButton()) {
        if (interaction.customId === 'refresh_status') {
            const updatedStatusEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Bot Status')
                .setDescription('🟢 Bot is working properly');

            await interaction.update({ embeds: [updatedStatusEmbed] });
        }
        if (interaction.customId === 'approve_pr') {
            // IT SHOULD TELL RITESHRAJAS TO APPROVE THE PR
            await interaction.reply('Approved the pull request');
        }
        if (interaction.customId === 'deny_pr') {
            // IT SHOULD TELL RITESHRAJAS TO DENY THE PR
            await interaction.reply('Denied the pull request');
        }
        // Other button interactions...
    }
});

// Express server setup
const app = express();
app.use(bodyParser.json());

app.post('/github-webhook', (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'push') {
        console.log('Push event received');
        const repoName = payload.repository.full_name;
        const pusher = payload.pusher.name;
        const commitMessage = payload.head_commit.message;
        const commitUrl = payload.head_commit.url; // URL to the commit diff

        // Filter programming commits
        latestProgrammingCommit = `💻 **Programming Group**: ${repoName} received a new push by ${pusher}: ${commitMessage}`;

        // Create an embed message for the push event
        const pushEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('New Push Event')
            .setDescription(`Repository: **${repoName}**\nPusher: **${pusher}**\nCommit Message: **${commitMessage}**`)
            .setTimestamp();

        // Create a button for viewing the diff
        const diffButton = new ButtonBuilder()
            .setLabel('View Diff')
            .setStyle(ButtonStyle.Link)
            .setURL(commitUrl);

        const row = new ActionRowBuilder().addComponents(diffButton);

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({ embeds: [pushEmbed], components: [row] });
        }
    }
    else if (event === 'issues') {
        const action = payload.action;
        const issueTitle = payload.issue.title;
        const repoName = payload.repository.full_name;
        const issueUrl = payload.issue.html_url; // URL to the issue

        // Create an embed message for the issue event
        const issueEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Issue Event')
            .setDescription(`Repository: **${repoName}**\nIssue: **${issueTitle}**\nAction: **${action}**`)
            .setTimestamp();

        // Create a button for viewing the issue
        const issueButton = new ButtonBuilder()
            .setLabel('View Issue')
            .setStyle(ButtonStyle.Link)
            .setURL(issueUrl);

        const row = new ActionRowBuilder().addComponents(issueButton);

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({ embeds: [issueEmbed], components: [row] });
        }
    }
  else if (event === 'pull_request') {
    const action = payload.action;
    const prTitle = payload.pull_request.title;
    const repoName = payload.repository.full_name;
    const prUrl = payload.pull_request.html_url; // URL to the pull request

    // Create an embed message for the pull request event
    const prEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Pull Request Event')
        .setDescription(`Repository: **${repoName}**\nPull Request: **${prTitle}**\nAction: **${action}**`)
        .setTimestamp();

    // Create buttons for approving or denying the pull request
    const approveButton = new ButtonBuilder()
        .setCustomId('approve_pr')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success);

    const denyButton = new ButtonBuilder()
        .setCustomId('deny_pr')
        .setLabel('Deny')
        .setStyle(ButtonStyle.Danger);

    const viewButton = new ButtonBuilder()
        .setLabel('View Pull Request')
        .setStyle(ButtonStyle.Link)
        .setURL(prUrl);

    const row = new ActionRowBuilder().addComponents(approveButton, denyButton, viewButton);
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send({ embeds: [prEmbed], components: [row] });
    }

}
    else if (event === 'ping') {
        console.log('Ping event received');

        // Create an embed message for the ping event
        const pingEmbed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('Ping Event')
            .setDescription('Ping event received')
            .setTimestamp();

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({ embeds: [pingEmbed] });
        }
    }

    res.status(200).send('Webhook received');
});
// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

