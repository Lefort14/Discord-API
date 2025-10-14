const { SlashCommandBuilder } = require("discord.js");
const { stopPlayer } = require("./controllers/music-player");
const { playerState } = require("./classes/playerState-fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Останавливает проигрыш треков!"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.voice.channel) {
      return interaction.editReply(
        "**Ты не в можешь остановить воспроизведение, так как ты не в голосовом чате!**"
      );
    }

    if (!playerState.player) {
      return interaction.editReply("**Нет активного воспроизведения!**");
    }

    if (!interaction.guild.members.me.voice.channelId) {
      return interaction.editReply("**Бот не в голосовом чате!**");
    }

    try {
      stopPlayer(interaction);
    } catch (error) {
      console.log("Произошла ошибка:" + ` ${error}`);
      return interaction.editReply("**Произошла ошибка!**");
    }
  },
};
