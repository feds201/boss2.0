// src/commands/commandList.js
const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = require('../config');

// Define all commands
const commands = [    {
        name: 'team_info',
        description: 'Displays detailed information about an FRC team',
        options: [
            {
                name: 'team_number',
                description: 'The FRC team number to look up (defaults to 201 if not specified)',
                type: 4, // Integer type
                required: false,
            },
            {
                name: 'use_ai',
                description: 'Whether to use AI to enhance the team information (may take longer)',
                type: 5, // Boolean type
                required: false,
            }
        ],
    },
    {
        name: 'get_machine_ip',
        description: 'Fetches the IP address of the machine',
    },
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
                type: 3, // String type,
                required: true,
            }
        ]
    },
    {
        name: 'set_channel_id',
        description: 'Sets the channel ID for the bot', 
        options: [{
            name: 'channel_id', 
            description: 'The ID of the channel', 
            type: 3, 
            required: true
        }]
    },
];

// Function to register all commands
const registerCommands = async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        
        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
        
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
};

module.exports = {
    commands,
    registerCommands
};
