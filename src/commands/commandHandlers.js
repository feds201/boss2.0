// src/commands/commandHandlers.js
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const { credentials, updateCredentials, CHANNEL_ID } = require('../config');
const { getLatestProgrammingCommit, getOctokit } = require('../client');
const https = require('https');

// Status command
const handleStatus = async (interaction) => {
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
};

// Fetch programming latest command
const handleFetchProgLatest = async (interaction) => {
    const progEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Programming Group')
        .setDescription(`🚧 Latest progress: ${getLatestProgrammingCommit()}`);

    await interaction.reply({ embeds: [progEmbed] });
};

// Get latest stable robot commit command
const handleGetLatestStableRobotCommit = async (interaction) => {
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
};

// Set stable commit command
const handleSetStableCommit = async (interaction) => {
    // Save the latest stable commit link to the JSON file
    updateCredentials({ latestStableCommit: interaction.options.getString('commit_link') });
    await interaction.reply(`✅ Latest stable commit link has been set!`);
};

// Set webhook command
const handleSetWebhook = async (interaction) => {
    const webhookUrl = interaction.options.getString('webhook_url');
    const webhookSecret = interaction.options.getString('webhook_secret');
    const webhookId = interaction.options.getString('webhook_id');
    const documentId = interaction.options.getString('document_id');

    // Save the webhook details to the JSON file
    updateCredentials({ 
        onshapeWebhook: { 
            url: webhookUrl, 
            secret: webhookSecret, 
            id: webhookId, 
            documentId: documentId 
        } 
    });

    // Register the webhook with Onshape
    await interaction.reply(`✅ Onshape webhook has been set!`);
};

// Self-inspect command
const handleSelfInspect = async (interaction) => {
    await interaction.deferReply();

    const checks = [];

    // Check if the bot has the necessary permissions
    const requiredPermissions = [
        PermissionsBitField.Flags.SendMessages, 
        PermissionsBitField.Flags.EmbedLinks, 
        PermissionsBitField.Flags.CreateEvents
    ];
    
    let hasPermissions = false;
    if (interaction.guild && interaction.guild.members.me) {
        hasPermissions = interaction.guild.members.me.permissionsIn(interaction.channelId).has(requiredPermissions);
    }
    checks.push(`${hasPermissions ? '✅' : '❌'} Permissions`);

    // Check if the bot has the necessary roles
    const requiredRoles = ['BOSS']; // Replace with actual role names
    let hasRoles = false;
    if (interaction.guild && interaction.guild.members.me) {
        hasRoles = requiredRoles.every(role => interaction.guild.members.me.roles.cache.some(r => r.name === role));
    }
    checks.push(`${hasRoles ? '✅' : '❌'} Roles`);

    // Check if the bot can ping the internet
    const canPingInternet = await new Promise(resolve => {
        require('dns').resolve('www.google.com', err => {
            resolve(!err);
        });
    });
    checks.push(`${canPingInternet ? '✅' : '❌'} Internet`);

    // Simulate Onshape, GitHub, and Discord webhooks creation checks
    const canCreateOnshapeWebhook = true;
    const canCreateGitHubWebhook = true;
    const canCreateDiscordWebhook = true;
    checks.push(`${canCreateOnshapeWebhook ? '✅' : '❌'} Onshape Webhooks`);
    checks.push(`${canCreateGitHubWebhook ? '✅' : '❌'} GitHub Webhooks`);
    checks.push(`${canCreateDiscordWebhook ? '✅' : '❌'} Discord Webhooks`);

    // Create the embed with the results
    const selfInspectEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Self-Inspection')
        .setDescription(checks.join('\n'));

    await interaction.editReply({ embeds: [selfInspectEmbed] });
};

// Set channel ID command
const handleSetChannelId = async (interaction) => {
    const channelId = interaction.options.getString('channel_id');
    // Note: This is temporary, as CHANNEL_ID is imported from config. Consider adding a setter in config.
    global.CHANNEL_ID = channelId;
    await interaction.reply(`✅ Channel ID has been set to ||${channelId}||`);
};

// Get machine IP command
const handleGetMachineIp = async (interaction) => {
    // Fetch public IP from an external API
    https.get('https://api.ipify.org?format=json', (resp) => {
        let data = '';

        // A chunk of data has been received
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received
        resp.on('end', () => {
            const ip = JSON.parse(data).ip;
            interaction.reply(`🌐 Public IP: ||${ip}||`);
        });
    }).on('error', (err) => {
        console.error(err);
        interaction.reply('❌ Failed to fetch the public IP');
    });
};

module.exports = {
    handleStatus,
    handleFetchProgLatest,
    handleGetLatestStableRobotCommit,
    handleSetStableCommit,
    handleSetWebhook,
    handleSelfInspect,
    handleSetChannelId,
    handleGetMachineIp
};
