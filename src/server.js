// src/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { handleGithubWebhook } = require('./webhooks/githubHandlers');

// Express server setup
const setupServer = () => {
    const app = express();
    app.use(bodyParser.json());

    // Register the GitHub webhook handler
    app.post('/github-webhook', handleGithubWebhook);

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    return app;
};

module.exports = { setupServer };
