// src/webhooks/githubHandlers.js
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../client');
const { setLatestProgrammingCommit } = require('../client');
let { CHANNEL_ID } = require('../config');

// Push event handler
const handlePushEvent = (payload) => {
    console.log('Push event received');
    const repoName = payload.repository.full_name;
    const pusher = payload.pusher.name;
    const commitMessage = payload.head_commit.message;
    const commitUrl = payload.head_commit.url; // URL to the commit diff
    const pusherAvatar = payload.sender.avatar_url;

    // Filter programming commits
    const newCommitMessage = `💻 **Programming Group**: ${repoName} received a new push by ${pusher}: ${commitMessage}`;
    setLatestProgrammingCommit(newCommitMessage);

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
};

// Pull request event handler
const handlePullRequestEvent = (payload) => {
    console.log(`Pull request event received ${payload.action}`);

    if (payload.action === 'opened') {
        const repoName = payload.repository.full_name;
        const prTitle = payload.pull_request.title;
        const prUrl = payload.pull_request.html_url;
        const prUser = payload.pull_request.user.login;
        const prAvatar = payload.pull_request.user.avatar_url;
        const prNumber = payload.pull_request.number;

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
};

// Issues event handler
const handleIssuesEvent = (payload) => {
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
};

// Release event handler
const handleReleaseEvent = (payload) => {
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
};

// Ping event handler
const handlePingEvent = (payload) => {
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
        channel.send({ embeds: [pingEmbed] });
    }
    console.log("Sent ping event");
};

// Installation event handler
const handleInstallationEvent = (payload) => {
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
    
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send({ embeds: [installationEmbed] });
    }
};

// Main webhook handler function
const handleGithubWebhook = (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    
    // Route to the appropriate event handler
    switch (event) {
        case 'push':
            handlePushEvent(payload);
            break;
        case 'pull_request':
            handlePullRequestEvent(payload);
            break;
        case 'issues':
            handleIssuesEvent(payload);
            break;
        case 'release':
            handleReleaseEvent(payload);
            break;
        case 'ping':
            handlePingEvent(payload);
            break;
        case 'installation':
            handleInstallationEvent(payload);
            break;
        default:
            console.log(`Event ${event} is not supported`);
    }

    res.status(200).send('Webhook received');
};

// Export all functions for use elsewhere
module.exports = {
    handleGithubWebhook,
    handlePushEvent,
    handlePullRequestEvent,
    handleIssuesEvent,
    handleReleaseEvent,
    handlePingEvent, 
    handleInstallationEvent,
    setChannelId: (channelId) => { CHANNEL_ID = channelId; }
};
