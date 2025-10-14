const { SlashCommandBuilder } = require("discord.js");
const { playerState } = require('./classes/playerState-fs.js')
const { prevTrackList } = require("./controllers/music-player.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prev")
    .setDescription("Переключает на предыдущий трек!"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.voice.channel) {
      return interaction.editReply(
        "**Ты не можешь переключить на предыдущий трек, так как ты не в голосовом чате!**"
      );
    }
    
    if (!playerState.player) {
      return interaction.editReply("**Нет активного воспроизведения!**");
    }

    if (!interaction.guild.members.me.voice.channelId) {
      return interaction.editReply("**Бот не в голосовом чате!**");
    }

    try {
      await prevTrackList(interaction);
    } catch (error) {
      console.log("Произошла ошибка:" + ` ${error}`);
      return interaction.editReply("**Произошла ошибка!**");
    }
  },
};

