// src/events/interactionHandler.js
const { 
    handleStatus,
    handleFetchProgLatest, 
    handleGetLatestStableRobotCommit,
    handleSetStableCommit,
    handleSetWebhook,
    handleSelfInspect,
    handleSetChannelId,
    handleGetMachineIp
} = require('../commands/commandHandlers');

const { 
    handleRefreshStatus, 
    handleApprovePR, 
    handleDenyPR 
} = require('../commands/buttonHandlers');

// Main interaction handler
const handleInteraction = async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        // Route to the appropriate command handler
        switch(commandName) {
            case 'status':
                await handleStatus(interaction);
                break;
            case 'fetch_prog_latest':
                await handleFetchProgLatest(interaction);
                break;
            case 'get_latest_stable_robot_commit':
                await handleGetLatestStableRobotCommit(interaction);
                break;
            case 'set_stable_commit':
                await handleSetStableCommit(interaction);
                break;
            case 'set_webhook':
                await handleSetWebhook(interaction);
                break;
            case 'self-inspect':
                await handleSelfInspect(interaction);
                break;
            case 'set_channel_id':
                await handleSetChannelId(interaction);
                break;
            case 'get_machine_ip':
                await handleGetMachineIp(interaction);
                break;
            default:
                await interaction.reply('❌ Command not found');
                break;
        }
    }
    else if (interaction.isButton()) {
        const { customId } = interaction;

        // Route to the appropriate button handler
        switch(customId) {
            case 'refresh_status':
                await handleRefreshStatus(interaction);
                break;
            case 'approve_pr':
                // Note: we need context for PR approval, which should be stored when creating the button
                // This is a placeholder that would need to be updated with proper PR context
                await handleApprovePR(interaction, null, null, null);
                break;
            case 'deny_pr':
                await handleDenyPR(interaction);
                break;
            default:
                console.log(`Unknown button interaction: ${customId}`);
                break;
        }
    }
};

module.exports = { handleInteraction };
