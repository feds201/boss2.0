module.exports = [
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
        options: [
            {
                name: 'channel_id',
                description: 'The ID of the channel',
                type: 3,
                required: true
            }
        ]
    }
];