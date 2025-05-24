// src/utils/apiUtils.js
const axios = require('axios');
const { TBA_API_KEY, GEMINI_API_KEY } = require('../config');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fetch team information from The Blue Alliance API
 * @param {number} teamNumber - The FRC team number
 * @returns {Promise<Object>} - Team information
 */
const fetchTeamInfoFromTBA = async (teamNumber) => {
    try {
        const baseUrl = 'https://www.thebluealliance.com/api/v3';
        const headers = { 'X-TBA-Auth-Key': TBA_API_KEY };

        // Get basic team info
        const teamResponse = await axios.get(`${baseUrl}/team/frc${teamNumber}`, { headers });
        
        // Get team events for the current year (2025)
        const eventsResponse = await axios.get(`${baseUrl}/team/frc${teamNumber}/events/2025`, { headers });
        
        // Get team awards
        const awardsResponse = await axios.get(`${baseUrl}/team/frc${teamNumber}/awards`, { headers });
        
        // Get team years participated
        const yearsResponse = await axios.get(`${baseUrl}/team/frc${teamNumber}/years_participated`, { headers });
        
        // Get team social media
        const socialResponse = await axios.get(`${baseUrl}/team/frc${teamNumber}/social_media`, { headers });

        return {
            team: teamResponse.data,
            events: eventsResponse.data,
            awards: awardsResponse.data,
            years: yearsResponse.data,
            social: socialResponse.data,
        };
    } catch (error) {
        console.error(`Error fetching TBA data for team ${teamNumber}:`, error.message);
        throw new Error(`Failed to fetch team info from The Blue Alliance: ${error.message}`);
    }
};

/**
 * Fetch team statistics from Statbotics API
 * @param {number} teamNumber - The FRC team number
 * @returns {Promise<Object>} - Team statistics
 */
const fetchTeamStatsFromStatbotics = async (teamNumber) => {
    try {
        // Get team statistics
        const teamStatsResponse = await axios.get(`https://api.statbotics.io/v3/team/${teamNumber}`);
        
        // Get team current season performance
        const yearStatsResponse = await axios.get(`https://api.statbotics.io/v3/team_year/${teamNumber}/2025`);

        return {
            overall: teamStatsResponse.data,
            currentYear: yearStatsResponse.data,
        };
    } catch (error) {
        console.error(`Error fetching Statbotics data for team ${teamNumber}:`, error.message);
        throw new Error(`Failed to fetch team stats from Statbotics: ${error.message}`);
    }
};

/**
 * Fetch team's EPA history data for the past 5 years
 * @param {number} teamNumber - The FRC team number
 * @returns {Promise<Array>} - Array of EPA data points with years
 */
const fetchTeamEPAHistory = async (teamNumber) => {
    try {
        const currentYear = 2025;
        const historyYears = 5;
        const historyData = [];
        
        // Fetch data for the last 5 years (or less if team hasn't competed that long)
        for (let year = currentYear; year > currentYear - historyYears; year--) {
            try {
                const response = await axios.get(`https://api.statbotics.io/v3/team_year/${teamNumber}/${year}`);
                if (response.data && response.data.norm_epa) {
                    historyData.push({
                        year,
                        epa: response.data.norm_epa,
                        events_played: response.data.events_played || 0
                    });
                }
            } catch (yearError) {
                // Skip years with no data
                console.log(`No data for team ${teamNumber} in ${year}`);
            }
        }
        
        return historyData;
    } catch (error) {
        console.error(`Error fetching EPA history for team ${teamNumber}:`, error.message);
        return [];
    }
};

/**
 * Use Google Gemini to get enhanced team information
 * @param {Object} teamData - Combined data from TBA and Statbotics
 * @returns {Promise<string>} - AI-generated insights
 */
const getAIInsights = async (teamData) => {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Safely extract team data with null checks
        const teamNumber = teamData.tba.team.team_number;
        const teamName = teamData.tba.team.nickname || 'Unknown Team';
        const rookieYear = teamData.tba.team.rookie_year || 'Unknown';
        const location = [teamData.tba.team.city, teamData.tba.team.state_prov, teamData.tba.team.country]
            .filter(Boolean)
            .join(', ') || 'Unknown location';
        const participationYears = teamData.tba.years?.length || 'Unknown number of';
        
        // Safely extract statistics
        const wins = teamData.statbotics.overall.record?.wins || 'Unknown';
        const losses = teamData.statbotics.overall.record?.losses || 'Unknown';
        const recentEPA = teamData.statbotics.overall.norm_epa?.recent || 'Unknown';
        
        const prompt = `
        You are an assistant with expertise in FIRST Robotics Competition (FRC).
        Provide a brief (3-4 sentences) analysis of FRC Team ${teamNumber} - "${teamName}" based on this data:
        
        - Founded: ${rookieYear}
        - Location: ${location}
        - Years of participation: ${participationYears} years
        - Win/Loss Record: ${wins}-${losses}
        - Recent EPA (Estimated Performance Assessment): ${recentEPA}
        
        Focus on their historical performance trends, notable achievements, and competitive strengths.
        Keep your response under 150 words and highlight what makes this team distinctive.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI insights:', error.message);
        return 'AI-powered insights unavailable at this time.';
    }
};

/**
 * Format the win rate as a progress bar with enhanced visuals
 * @param {number} winRate - Win rate as a decimal
 * @returns {string} - Progress bar representation
 */
const formatWinRateBar = (winRate) => {
    if (winRate === null || winRate === undefined || isNaN(winRate)) {
        return '`[             ] N/A`';
    }
    
    // Define colored bar segments based on win rate
    const barLength = 13;
    const filledBars = Math.round(winRate * barLength);
    const emptyBars = barLength - filledBars;
    
    // Use more visually appealing characters and add color indicators
    let colorIndicator = '🟨'; // Default yellow for average (around 50%)
    
    if (winRate >= 0.7) {
        colorIndicator = '🟩'; // Green for high win rate
    } else if (winRate <= 0.3) {
        colorIndicator = '🟥'; // Red for low win rate
    }
    
    // Use solid blocks for better visibility in Discord
    return `${colorIndicator} \`[${'█'.repeat(filledBars)}${' '.repeat(emptyBars)}] ${Math.round(winRate * 100)}%\``;
};

/**
 * Generate an enhanced visual ASCII graph of EPA history
 * @param {Array} historyData - Array of EPA history data points
 * @returns {string} - ASCII representation of the EPA graph with improved visuals
 */
const generateEPAGraph = (historyData) => {
    if (!historyData || historyData.length === 0) {
        return "No historical EPA data available";
    }
    
    // Sort by year ascending
    historyData.sort((a, b) => a.year - b.year);
    
    // Find min and max EPA values for scaling
    const epaValues = historyData.map(item => item.epa.mean || 0);
    const minEPA = Math.min(...epaValues);
    const maxEPA = Math.max(...epaValues);
    
    // Ensure a reasonable range for the graph
    let range = maxEPA - minEPA;
    if (range < 1) range = 1; // Minimum range to avoid flat graphs
    
    // Define graph height (number of rows)
    const graphHeight = 6; // Slightly taller for better visualization
    const graphWidth = historyData.length;
    
    // Create the graph rows
    let graph = '';
    
    // Add title with improved formatting
    graph += `📈 EPA Rating Trend (${minEPA.toFixed(1)}-${maxEPA.toFixed(1)})\n`;
    
    // Generate graph content with enhanced visuals
    for (let row = 0; row < graphHeight; row++) {
        const epaThreshold = maxEPA - (row * (range / (graphHeight - 1)));
        
        // Add y-axis value with proper padding
        if (row === 0) {
            graph += `${maxEPA.toFixed(1).padStart(5)} ┃`; // Use thicker vertical bar
        } else if (row === graphHeight - 1) {
            graph += `${minEPA.toFixed(1).padStart(5)} ┃`;
        } else if (row === Math.floor(graphHeight / 2)) {
            const midValue = minEPA + (range / 2);
            graph += `${midValue.toFixed(1).padStart(5)} ┃`;
        } else {
            graph += `      ┃`;
        }
        
        // Add trend indicators for each year with improved visuals
        for (let col = 0; col < graphWidth; col++) {
            const epa = historyData[col].epa.mean || 0;
            
            // Choose characters based on relative position
            if (epa >= epaThreshold) {
                // Use different characters based on position to create a smoother look
                const heightRatio = (epa - minEPA) / range;
                if (heightRatio > 0.8) graph += '▓'; // Very high
                else if (heightRatio > 0.5) graph += '▒'; // High
                else graph += '░'; // Medium
            } else if (row === graphHeight - 1) {
                graph += '▁'; // Bottom line
            } else {
                graph += ' '; // Empty space
            }
        }
        graph += '\n';
    }
    
    // Add x-axis with thicker line
    graph += `      ┗${'━'.repeat(graphWidth)}\n`;
    
    // Add years with better spacing and highlighted current year
    graph += '        ';
    for (const data of historyData) {
        // Highlight current or most recent year
        const isCurrentYear = data.year === new Date().getFullYear();
        if (isCurrentYear) {
            graph += `${data.year.toString().slice(-2)}* `;
        } else {
            graph += `${data.year.toString().slice(-2)}  `;
        }
    }
    
    // Add trend indicator
    if (historyData.length >= 2) {
        const firstEPA = historyData[0].epa.mean || 0;
        const lastEPA = historyData[historyData.length - 1].epa.mean || 0;
        const trend = lastEPA - firstEPA;
        
        if (trend > 0.5) {
            graph += '\n\n↗️ Upward trend: Team has been improving significantly';
        } else if (trend > 0.2) {
            graph += '\n\n↗️ Slight improvement over time';
        } else if (trend < -0.5) {
            graph += '\n\n↘️ Downward trend: Team has been declining';
        } else if (trend < -0.2) {
            graph += '\n\n↘️ Slight decline over time';
        } else {
            graph += '\n\n➡️ Stable performance over time';
        }
    }
    
    return '```\n' + graph + '\n```';
};

/**
 * Format social media links for better display in Discord embeds
 * @param {Array} socialMediaList - Array of social media objects from TBA API
 * @returns {string} - Formatted string with icons and clickable links
 */
const formatSocialMediaLinks = (socialMediaList) => {
    if (!socialMediaList || socialMediaList.length === 0) {
        return 'No social media profiles found';
    }
    
    const socialIcons = {
        'facebook-profile': '👥 Facebook',
        'twitter-profile': '🐦 Twitter', 
        'youtube-channel': '📺 YouTube',
        'instagram-profile': '📷 Instagram',
        'github-profile': '💻 GitHub',
        'twitch-channel': '🎮 Twitch',
        'linkedin-profile': '📋 LinkedIn'
    };
    
    const formatSocialUrl = (type, username) => {
        const baseUrls = {
            'facebook-profile': 'https://www.facebook.com/',
            'twitter-profile': 'https://twitter.com/',
            'youtube-channel': 'https://www.youtube.com/channel/',
            'instagram-profile': 'https://www.instagram.com/',
            'github-profile': 'https://github.com/',
            'twitch-channel': 'https://www.twitch.tv/',
            'linkedin-profile': 'https://www.linkedin.com/in/'
        };
        
        // Handle special cases for channels that don't follow the simple pattern
        if (type === 'youtube-channel' && !username.startsWith('UC')) {
            return `https://www.youtube.com/user/${username}`;
        }
        
        return baseUrls[type] ? `${baseUrls[type]}${username}` : username;
    };
    
    // Format and sort links by type for consistent display
    return socialMediaList
        .sort((a, b) => {
            // Sort by icon name alphabetically
            const iconA = socialIcons[a.type] || '🔗 Other';
            const iconB = socialIcons[b.type] || '🔗 Other';
            return iconA.localeCompare(iconB);
        })
        .map(social => {
            const icon = socialIcons[social.type] || '🔗 Link';
            const url = formatSocialUrl(social.type, social.foreign_key);
            return `${icon}: [${social.foreign_key}](${url})`;
        })
        .join('\n');
};

module.exports = {
    fetchTeamInfoFromTBA,
    fetchTeamStatsFromStatbotics,
    fetchTeamEPAHistory,
    getAIInsights,
    formatWinRateBar,
    generateEPAGraph,
    formatSocialMediaLinks
};
