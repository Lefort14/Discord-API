const { SlashCommandBuilder } = require("discord.js");
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");
const playerState = require("./state/playerState-fs.js");
const musicPath = require("./state/path.js"); // путь к папке с музыкой
const { ArrayNavigator } = require('./state/navigator.js') // экземпляр класса линейного перемещения по массиву

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
  // .addStringOption((option) =>
  // option
  // .setName("folder")
  // .setDescription("Выберите песню из папки!")
  // .setRequired(false)
  // .addChoices(
  // )

  // )
  async execute(interaction) { // иницализируем функцию
   
    await interaction.deferReply();  // ожидание ответа

 
    if (!interaction.member.voice.channel) { // если пользователь не в чате, то возвращаемм результат
      return interaction.editReply(`**зайди в голосовой чат!**`);
    }

    if (!playerState.connection) { // если нет подключения, то создаём его. "Войти в комнату с колонками"
      playerState.connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
    }

    const track = interaction.options.getString("choice"); // считываем значение ввода аргумента слеш команды

    // Поиск песни в папке
    const files = fs.readdirSync(musicPath); // перебираем папку с музыкой
    const founder = files.filter((file) => { // фильтруем папку с музыкой
      return file.toLowerCase().includes(track.toLowerCase()); // приводим названием файлов к нижнем регистру и ищем песню по названию вводу, тоже приведённому к нижнему регистру
    });

    if (founder.length === 0) { // если не найдено ни одного совпадения, то возвращаемм результат
      return interaction.editReply(`**Трек "${track}" не найден!**`);
    }

    const randomIndex = Math.floor(Math.random() * founder.length); // создаём рандомайзер для найденных файлов
    const selectedTrack = founder[randomIndex]; // создаём переменную файла с рандомным индексом

    if (playerState.isPlaying) { // если песня уже играет, то передаём найденный файл в очередь
      playerState.queue.push(selectedTrack);
      return interaction.editReply(
        `**Добавлено в очередь: ${selectedTrack}. Позиция в очереди: ${playerState.queue.length}**`
      );
    } else {
      playerState.queue.push(selectedTrack);
    }

    // Воспроизведение
    playerState.isPlaying = true; // меняем состояние isPlaying на true
    playerState.currentTrack = selectedTrack; // передаём в свойство текущий трек
    playTrack(selectedTrack, interaction); // запускаемм функцию
  },
  playTrack: playTrack,
};


///////////////////////////////////////////


function playTrack(track, interaction) {

  const resource = createAudioResource(`${musicPath}/` + `${track}`); // создаём папку с аудиоресурсом. "Выбрать песню в приложении"

  if (!playerState.player) { // если нет аудиоплеера, то создаём его
    playerState.player = createAudioPlayer(); // "Включить музыку на телефоне"
    playerState.connection.subscribe(playerState.player); // "Подключить телефон к колонкам"
  } else {
  // Удаляем старые обработчики перед добавлением новых
    playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
    playerState.player.removeAllListeners('error');
}

  playerState.player.play(resource); // "Нажать play на телефоне"
  if (playerState.queue.length > 0) {
    interaction.editReply(
      `**Сейчас играет: ${track}. Позиция в очереди: ${playerState.queue.index + 1}**`
    );
  } else interaction.editReply(`**Сейчас играет: ${track}**`);

  playerState.player.on(AudioPlayerStatus.Idle, () => { // если песня закончилась, то включить следующий трек в очереди, если его нет, то переключаем состояние плеера
    if (playerState.queue.length > 0) {
      playerState.nextTrack = playerState.queue.next()
      // playerState.nextTrack = playerState.queue.shift()
      playTrack(playerState.nextTrack, interaction);
    } else {
      playerState.isPlaying = false;
      playerState.currentTrack = null;
    }
  });
  
  playerState.player.on("error", (error) => {   // Обработка ошибок воспроизведения
    console.log('Произошла ошибка:' + ` ${error}`);
  });
}