// Main entry point for the FalconBot
require('dotenv').config();
const { bootstrap } = require('./src/bootstrap');

/**
 * Main application entry point
 * Orchestrates the initialization process for all components
 */
(async () => {
    console.log('Starting FalconBot...');
    
    try {
        // Bootstrap the application and get initialized components
        const { client, app } = await bootstrap();
        console.log('FalconBot startup complete!');
        
        // Handle process termination gracefully
        process.on('SIGINT', () => {
            console.log('Shutting down FalconBot...');
            client.destroy();
            process.exit(0);
        });
        
        // Export for potential use in tests or other files
        module.exports = { client, app };
    } catch (error) {
        console.error('Fatal error during startup:', error);
        process.exit(1);
    }
})();