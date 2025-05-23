// src/commands/buttonHandlers.js
const { EmbedBuilder } = require('discord.js');
const { getOctokit } = require('../client');

// Refresh status button handler
const handleRefreshStatus = async (interaction) => {
    const updatedStatusEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Bot Status')
        .setDescription('🟢 Bot is working properly');

    await interaction.update({ embeds: [updatedStatusEmbed] });
};

// Approve PR button handler
const handleApprovePR = async (interaction, owner, repo, prNumber) => {
    console.log('Approving the PR');
    const octokit = getOctokit();

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
};

// Deny PR button handler
const handleDenyPR = async (interaction) => {
    // Notify the team member to deny the PR
    await interaction.reply('Denied the pull request');
};

module.exports = {
    handleRefreshStatus,
    handleApprovePR,
    handleDenyPR
};
