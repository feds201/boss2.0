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

// AI Insights button handler
const handleAIInsights = async (interaction) => {
    try {
        const teamNumber = interaction.customId.split('_').pop();
        
        // Defer the update as generating insights might take time
        await interaction.deferUpdate();
        
        let insights;
        
        // Check if insights are already stored in memory
        if (global.teamInsights && global.teamInsights[teamNumber]) {
            insights = global.teamInsights[teamNumber];
        } else {
            // If not in memory, fetch the team data and generate insights
            const { fetchTeamInfoFromTBA, fetchTeamStatsFromStatbotics, getAIInsights } = require('../utils/apiUtils');
            
            const tbaData = await fetchTeamInfoFromTBA(teamNumber);
            const statboticsData = await fetchTeamStatsFromStatbotics(teamNumber);
            
            insights = await getAIInsights({ tba: tbaData, statbotics: statboticsData });
            
            // Store for future use
            global.teamInsights = global.teamInsights || {};
            global.teamInsights[teamNumber] = insights;
        }
          // Create an enhanced embed for the AI insights with better styling
        const insightsEmbed = new EmbedBuilder()
            .setColor('#8E44AD') // Rich purple color for AI
            .setTitle(`🧠 AI Analysis: Team ${teamNumber}`)
            .setDescription(insights)
            .addFields({
                name: '💡 How to Use This Analysis',
                value: 'This AI-generated insight provides a strategic overview based on the team\'s historical performance data. Use it to inform your alliance selection strategy and match preparation.'
            })
            .setFooter({ 
                text: 'Powered by Google Gemini AI | Data from TBA & Statbotics',
                iconURL: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini_advanced_hero_1.width-1000.format-webp.webp'
            });
            
        // Get the existing embeds from the message
        const existingEmbeds = interaction.message.embeds;
        
        // Update with both existing team info and new AI insights
        await interaction.editReply({
            embeds: [...existingEmbeds, insightsEmbed],
            components: interaction.message.components
        });
    } catch (error) {
        console.error('Error generating AI insights:', error);
          // Enhanced error handling with more helpful information
        const errorEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('❌ AI Insights Unavailable')
            .setDescription('We couldn\'t generate AI insights for this team right now.')
            .addFields(
                {
                    name: '🔍 What Happened',
                    value: 'The AI service encountered a problem while analyzing the team data. This could be due to API limits, connectivity issues, or insufficient data.'
                },
                {
                    name: '💡 What You Can Do',
                    value: 'Try again in a few minutes, or check the team information on The Blue Alliance for more details.'
                },
                {
                    name: '⚙️ Technical Details',
                    value: `\`\`\`\n${error.message.substring(0, 256)}\n\`\`\``
                }
            )
            .setFooter({ 
                text: 'Team information remains available',
                iconURL: 'https://www.thebluealliance.com/images/logo_blue_background_tinythumb.gif'
            });
            
        await interaction.editReply({
            embeds: [...interaction.message.embeds, errorEmbed]
        });
    }
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
    handleDenyPR,
    handleAIInsights
};
