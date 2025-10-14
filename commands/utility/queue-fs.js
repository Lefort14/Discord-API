const { SlashCommandBuilder } = require("discord.js");
const { playerState } = require("./classes/playerState-fs");
const { queue } = require('./controllers/music-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Показывает очередь треков"),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!interaction.member.voice.channel) {
        return interaction.editReply(
          "**Ты не можешь просмотреть, так как ты не в голосовом чате!**"
        );
      }

      if (!interaction.member.voice.channel) {
        interaction.editReply("**зайди в голосовой чат!**");
      }

      if (playerState.queue.length === 0) {
        return interaction.editReply("**Нет очереди треков!**");
      }

      if (!interaction.guild.members.me.voice.channelId) {
        return interaction.editReply("**Бот не в голосовом чате!**");
      }

      if (playerState.queue.length > 0) {
        queue(interaction);
      } else {
        return interaction.editReply("**Нет активной очереди треков!**");
      }
    } catch (error) {
      console.log("Произошла ошибка:" + ` ${error}`);
      console.error(error);
      return interaction.editReply("**Произошла ошибка!**");
    }
  }
};


