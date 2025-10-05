const {
  SlashCommandBuilder,
} = require("discord.js");
const {
  joinVoiceChannel,
} = require("@discordjs/voice");
const { playTrack,
    getMP3Metadata,
    embedFn, 
    playerState
} = require('./controllers/music-player.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Играет музыку!")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Введите название песни!")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // инициализируем функцию
  
      await interaction.deferReply(); // ожидание ответа
  
      if (!interaction.member.voice.channel) {
        // если пользователь не в чате, то возвращаем результат
        return interaction.editReply(`**зайди в голосовой чат!**`);
      }
  
      const track = interaction.options.getString("choice"); // считываем значение ввода аргумента слеш команды
  
      const getTrack = await getMP3Metadata(track, interaction);
      if (!getTrack) return;
  
      if (!playerState.connection) {
        // если нет подключения, то создаём его. "Войти в комнату с колонками"
        playerState.connection = joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }
      // Воспроизведение
      const selectedTrack = getTrack.trackFullName;
      playerState.currentTrack = selectedTrack; // передаём в свойство текущий трек
  
      if (!playerState.currentTrack) return;
  
      const getEmbed = await embedFn(
        getTrack.trackFullName,
        getTrack.songName,
        getTrack.authorName,
        getTrack.time,
        getTrack.url,
        getTrack.files
      );
  
      await interaction.editReply(getEmbed);
      
      if (playerState.isPlaying) return console.log("Добавлено в очередь");
     
  
      playerState.isPlaying = true; // меняем состояние isPlaying на true
      await playTrack(selectedTrack, interaction); // запускаем функцию
    } catch (error) {
      console.log(`Произошла ошибка при запуске плеера: ${error.message}`)
      return await interaction.editReply('**Ошибка при запуске плеера!**')
    }
  },
};


