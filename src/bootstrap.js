// src/bootstrap.js
// Handles the initialization of commands, client, and event handlers

/**
 * Initializes command registration
 * @returns {Promise<void>}
 */
const initCommands = async () => {
    const { registerCommands } = require('./commands/commandList');
    try {
        console.log('Registering bot commands...');
        await registerCommands();
        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Failed to register commands:', error);
        throw error; // Rethrow to allow handling at a higher level
    }
};

/**
 * Initializes the Discord client and sets up event handlers
 * @returns {Promise<void>}
 */
const initDiscordClient = async () => {
    const { client, initClient } = require('./client');
    const { handleInteraction } = require('./events/interactionHandler');
    
    try {
        console.log('Initializing Discord client...');
        await initClient();
        
        // Set up event handlers
        client.on('interactionCreate', handleInteraction);
        
        console.log('Bot is ready and listening for interactions!');
        return client;
    } catch (error) {
        console.error('Failed to initialize client:', error);
        throw error; // Rethrow to allow handling at a higher level
    }
};

/**
 * Initializes the Express server for webhooks
 * @returns {Express.Application} The configured Express app
 */
const initServer = () => {
    const { setupServer } = require('./server');
    console.log('Setting up webhook server...');
    const app = setupServer();
    console.log('Webhook server initialized');
    return app;
};

/**
 * Main bootstrapping function that initializes all components
 * @returns {Promise<{client: object, app: object}>}
 */
const bootstrap = async () => {
    try {
        // Register commands first
        await initCommands();
        
        // Initialize Discord client
        const client = await initDiscordClient();
        
        // Set up Express server
        const app = initServer();
        
        return { client, app };
    } catch (error) {
        console.error('Failed to bootstrap application:', error);
        process.exit(1); // Exit on critical error
    }
};

module.exports = {
    bootstrap,
    initCommands,
    initDiscordClient,
    initServer
};
