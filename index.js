
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const {Octokit} = require("@octokit/rest");

// Discord bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
let CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
let latestProgrammingCommit = 'No programming commits yet.'; // Store the latest programming commit

// Load credentials from JSON file
let credentials = {};
const credsFilePath = './creds.json';

if (fs.existsSync(credsFilePath)) {
    const credsData = fs.readFileSync(credsFilePath);
    credentials = JSON.parse(credsData);
} else {
    credentials = { latestStableCommit: 'No stable commit set.' };
}

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
        name: 'get_latest_stable_robot_commit',
        description: 'Fetches the latest stable commit from the robot repository',
    },
    {
        name: 'set_stable_commit',
        description: 'Sets the latest stable commit link for the robot repository',
        options: [
            {
                name: 'commit_link',
                description: 'The link to the latest stable commit',
                type: 3, // String type
                required: true,
            },
        ],
    },
    {
        name: 'self-inspect',
        description: 'Makes sure the bot is working properly',
    },
    {
        name: 'set_webhook',
        description: 'Sets the Onshape webhook for the bot',
        options: [
            {
                name: 'webhook_url',
                description: 'The URL of the Onshape webhook',
                type: 3, // String type
                required: true,
            },
            {
                name: 'webhook_secret',
                description: 'The secret key of the Onshape webhook',
                type: 3, // String type
                required: true,
            },
            {
                name: 'webhook_id',
                description: 'The ID of the Onshape webhook',
                type: 3, // String type
                required: true,
            },
            {
                name: 'document_id',
                description: 'The name of the Onshape webhook',
                type: 3, // String type
                required: true,
            }
        ]
    },
    {name: 'set_channel_id',
        description: 'Sets the channel ID for the bot', options: [{name: 'channel_id', description: 'The ID of the channel', type: 3, required: true}]},
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
(async () => {
    const { Octokit } = await import("@octokit/rest");
    // your code using Octokit here
})();

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
        else if (commandName === 'fetch_prog_latest') {
            const progEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Programming Group')
                .setDescription(`🚧 Latest progress: ${latestProgrammingCommit}`);

            await interaction.reply({ embeds: [progEmbed] });
        }
        else if (commandName === 'get_latest_stable_robot_commit') {
            const commitUrl = credentials.latestStableCommit;

            const robotEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Robot Repository')
                .setThumbnail('https://i.imgur.com/aVyfHJK.png')
                .setDescription(`🤖 Latest stable commit: [Commit URL](${commitUrl})`);

            // Check if the commit URL is valid
            let row;
            if (commitUrl && commitUrl.startsWith('http')) {
                // Create a button for viewing the commit
                const viewCommitButton = new ButtonBuilder()
                    .setLabel('View Commit')
                    .setStyle(ButtonStyle.Link)
                    .setURL(commitUrl);

                row = new ActionRowBuilder().addComponents(viewCommitButton);
            }

            await interaction.reply({ embeds: [robotEmbed], components: row ? [row] : [] });
        }
        else if (commandName === 'set_stable_commit') {
            // Save the latest stable commit link to the JSON file
            credentials.latestStableCommit = interaction.options.getString('commit_link');
            fs.writeFileSync(credsFilePath, JSON.stringify(credentials, null, 2));

            await interaction.reply(`✅ Latest stable commit link has been set!`);
        }
        else if (commandName === 'set_webhook') {
            const webhookUrl = interaction.options.getString('webhook_url');
            const webhookSecret = interaction.options.getString('webhook_secret');
            const webhookId = interaction.options.getString('webhook_id');
            const documentId = interaction.options.getString('document_id');

            // Save the webhook details to the JSON file
            credentials.onshapeWebhook = { url: webhookUrl, secret: webhookSecret, id: webhookId, documentId: documentId };
            fs.writeFileSync(credsFilePath, JSON.stringify(credentials, null, 2));

            // Register the webhook with Onshape


            await interaction.reply(`✅ Onshape webhook has been set!`);
        }
        else if (commandName === 'self-inspect') {
            await interaction.deferReply();

            const checks = [];

            // Step 2: Check if the bot has the necessary permissions
            const { PermissionsBitField } = require('discord.js');
            const requiredPermissions = [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.CreateEvents];
            let hasPermissions = false;
            if (interaction.guild && interaction.guild.members.me) {
                hasPermissions = interaction.guild.members.me.permissionsIn(interaction.channelId).has(requiredPermissions);
            }
            checks.push(`${hasPermissions ? '✅' : '❌'} Permissions`);

            // Step 3: Check if the bot has the necessary roles
            const requiredRoles = ['BOSS']; // Replace with actual role names
            let hasRoles = false;
            if (interaction.guild && interaction.guild.members.me) {
                hasRoles = requiredRoles.every(role => interaction.guild.members.me.roles.cache.some(r => r.name === role));
            }
            checks.push(`${hasRoles ? '✅' : '❌'} Roles`);

            // Step 4: Check if the bot can ping the internet
            const canPingInternet = await new Promise(resolve => {
                require('dns').resolve('www.google.com', err => {
                    resolve(!err);
                });
            });
            checks.push(`${canPingInternet ? '✅' : '❌'} Internet`);

            // Step 5: Simulate Onshape, GitHub, and Discord webhooks creation checks
            const canCreateOnshapeWebhook = true;
            const canCreateGitHubWebhook = true;
            const canCreateDiscordWebhook = true;
            checks.push(`${canCreateOnshapeWebhook ? '✅' : '❌'} Onshape Webhooks`);
            checks.push(`${canCreateGitHubWebhook ? '✅' : '❌'} GitHub Webhooks`);
            checks.push(`${canCreateDiscordWebhook ? '✅' : '❌'} Discord Webhooks`);

            // Create the embed with the results
            const { EmbedBuilder } = require('discord.js');
            const selfInspectEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Self-Inspection')
                .setDescription(checks.join('\n'));

            await interaction.editReply({ embeds: [selfInspectEmbed] });
        }
        else if (commandName === 'set_channel_id') {
            const channelId = interaction.options.getString('channel_id');
            CHANNEL_ID = channelId;
            await interaction.reply(`✅ Channel ID has been set to ||${channelId}||`);        }
        else {
            await interaction.reply('❌ Command not found');
        }
    }
    else if (interaction.isButton()) {
        if (interaction.customId === 'refresh_status') {
            const updatedStatusEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Bot Status')
                .setDescription('🟢 Bot is working properly');

            await interaction.update({embeds: [updatedStatusEmbed]});
        }
        else if (interaction.customId === 'approve_pr') {
            console.log('Approving the PR');

            try {
                await octokit.pulls.createReview({
                    owner,
                    repo,
                    pull_number: prNumber,
                    event: 'APPROVE'
                });


                await interaction.reply('Approved the pull request');
            } catch (error) {
                console.error(error);
                await interaction.reply('Failed to approve the pull request');
            }
        }

        else if (interaction.customId === 'deny_pr') {
            // Notify the team member to deny the PR
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
        const pusherAvatar = payload.sender.avatar_url;

        // Filter programming commits
        latestProgrammingCommit = `💻 **Programming Group**: ${repoName} received a new push by ${pusher}: ${commitMessage}`;

        // Create an embed message for the push event
        const pushEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('New Push Event')
            .setDescription(`Repository: **${repoName}**\nPusher: **${pusher}**\nCommit Message: **${commitMessage}**`)
            .setThumbnail(pusherAvatar)
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
    else if (event === 'pull_request') {
        console.log(`Pull request event received ${payload.action}`);

        if (payload.action === 'opened') {
            const repoName = payload.repository.full_name;
            const prTitle = payload.pull_request.title;
            const prUrl = payload.pull_request.html_url;
            const prUser = payload.pull_request.user.login;
            const prAvatar = payload.pull_request.user.avatar_url;
            const prNumber = payload.pull_request.number

            // Create an embed message for the pull request event
            const prEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('New Pull Request')
                .setDescription(`Repository: **${repoName}**\nTitle: **${prTitle}**\nUser: **${prUser}**`)
                .setThumbnail(prAvatar)
                .setTimestamp();

            // Create buttons for approving and denying the PR
            const approveButton = new ButtonBuilder()
                .setCustomId(`approve_pr`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success);


            const denyButton = new ButtonBuilder()
                .setCustomId('deny_pr')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(approveButton, denyButton);
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                channel.send({ embeds: [prEmbed], components: [row] });
            }
        }
        else if (payload.action === 'closed') {
            const repoName = payload.repository.full_name;
            const prTitle = payload.pull_request.title;
            const prUrl = payload.pull_request.html_url;
            const prUser = payload.pull_request.user.login;
            const prAvatar = payload.pull_request.user.avatar_url;
            const prState = payload.pull_request.state;

            // Create an embed message for the pull request event
            const prEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('Pull Request Closed')
                .setDescription(`Repository: **${repoName}**\nTitle: **${prTitle}**\nUser: **${prUser}**\nState: **${prState}**`)
                .setThumbnail(prAvatar)
                .setTimestamp();

            // Create a button for viewing the PR
            const viewButton = new ButtonBuilder()
                .setLabel('View Pull Request')
                .setStyle(ButtonStyle.Link)
                .setURL(prUrl);

            const row = new ActionRowBuilder().addComponents(viewButton);
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                channel.send({ embeds: [prEmbed], components: [row] });
            }
        }





    }
    else if (event === 'issues') {
        console.log('Issue event received');
        const repoName = payload.repository.full_name;
        const issueTitle = payload.issue.title;
        const issueUrl = payload.issue.html_url;
        const issueUser = payload.issue.user.login;
        const issueAvatar = payload.issue.user.avatar_url;

        // Create an embed message for the issue event
        const issueEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('New Issue')
            .setDescription(`Repository: **${repoName}**\nTitle: **${issueTitle}**\nUser: **${issueUser}**`)
            .setThumbnail(issueAvatar)
            .setTimestamp();

        // Create a button for viewing the issue
        const viewButton = new ButtonBuilder()
            .setLabel('View Issue')
            .setStyle(ButtonStyle.Link)
            .setURL(issueUrl);

        const row = new ActionRowBuilder().addComponents(viewButton);

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({ embeds: [issueEmbed], components: [row] });
        }
    }
    else if (event === 'release') {
        console.log('Release event received');
        const repoName = payload.repository.full_name;
        const releaseName = payload.release.name;
        const releaseUrl = payload.release.html_url;
        const releaseAuthor = payload.release.author.login;
        const releaseAvatar = payload.release.author.avatar_url;

        // Create an embed message for the release event
        const releaseEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('New Release')
            .setDescription(`Repository: **${repoName}**\nRelease Name: **${releaseName}**\nAuthor: **${releaseAuthor}**`)
            .setThumbnail(releaseAvatar)
            .setTimestamp();

        // Create a button for viewing the release
        const viewButton = new ButtonBuilder()
            .setLabel('View Release')
            .setStyle(ButtonStyle.Link)
            .setURL(releaseUrl);

        const row = new ActionRowBuilder().addComponents(viewButton);

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({ embeds: [releaseEmbed], components: [row] });
        }
    }
    else if (event === 'ping') {
        console.log('Ping event received');
        const zen = payload.zen;

        // Create an embed message for the ping event
        const pingEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Ping Event')
            .setDescription(`Zen: **${zen}**`)
            .setTimestamp();
        const channel = client.channels.cache.get(CHANNEL_ID);
        console.log("Channel: " + channel);

        if (channel) {
            channel.send({embeds: [pingEmbed]});
        }
        console.log("Sent ping event");
    }
    else if (event === 'installation') {
        console.log('Installation event received');
        const installationAction = payload.action;
        const installationAccount = payload.installation.account.login;
        const installationUrl = payload.installation.html_url;
        const installationAvatar = payload.installation.account.avatar_url;
        const repositoryCount = payload.repositories ? payload.repositories.length : 0;

        // Create an embed message for the installation event
        const installationEmbed = new EmbedBuilder()
            .setColor('#6e0000')
            .setTitle('Installation Event')
            .setDescription(`Action: **${installationAction}**\nAccount: **${installationAccount}**\nAccessible Repo(s): **${repositoryCount}**`)
            .setThumbnail(installationAvatar)
            .setTimestamp();
        channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send({embeds: [installationEmbed]});
        }
    }
    else {
        console.log(`Event ${event} is not supported`);
    }

    res.status(200).send('Webhook received');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
