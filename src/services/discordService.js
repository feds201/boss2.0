const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

class DiscordService {
  static createEmbed(title, description, color) {
    return new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
  }
  
  // ... other Discord helper methods
}

module.exports = DiscordService;