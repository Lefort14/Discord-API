const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");
const playerState = require("./state/playerState-fs.js");
const MUSIC_PATH = require("./state/path.js"); // путь к папке с музыкой
const { ArrayNavigator } = require("./state/navigator.js");
const NodeID3 = require("node-id3");
const path = require("path");

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
    // инициализируем функцию

    await interaction.deferReply(); // ожидание ответа

    if (!interaction.member.voice.channel) {
      // если пользователь не в чате, то возвращаем результат
      return interaction.editReply(`**зайди в голосовой чат!**`);
    }

    const track = interaction.options.getString("choice"); // считываем значение ввода аргумента слеш команды

    const getTrack = getMP3Metadata(track, interaction);
    if (!getTrack) return;
    const selectedTrack = getTrack.trackName;

    // Поиск песни в папке
    // const files = fs.readdirSync(MUSIC_PATH); // перебираем папку с музыкой
    // const founder = files.filter((file) => { // фильтруем папку с музыкой
    //   return file.toLowerCase().includes(track.toLowerCase()); // приводим названием файлов к нижнем регистру и ищем песню по названию вводу, тоже приведённому к нижнему регистру
    // });

    // if (founder.length === 0) { // если не найдено ни одного совпадения, то возвращаем результат
    //   return interaction.editReply(`**Трек "${track}" не найден!**`);
    // }

    // const randomIndex = Math.floor(Math.random() * founder.length); // создаём рандомайзер для найденных файлов
    // const selectedTrack = founder[randomIndex]; // создаём переменную файла с рандомным индексом

    if (!playerState.connection) {
      // если нет подключения, то создаём его. "Войти в комнату с колонками"
      playerState.connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
    }

    // if (playerState.isPlaying) { // если песня уже играет, то передаём найденный файл в очередь
    //   playerState.queue.push(selectedTrack);
    //   return interaction.editReply(
    //     `**Добавлено в очередь: ${selectedTrack}. Позиция в очереди: ${playerState.queue.length}**`
    //   );
    // } else {
    //   playerState.queue.push(selectedTrack);
    // }

    // Воспроизведение
    playerState.isPlaying = true; // меняем состояние isPlaying на true
    playerState.currentTrack = selectedTrack; // передаём в свойство текущий трек
    await interaction.editReply(getTrack);
    if (!getTrack.musicState) {
      playTrack(selectedTrack, interaction); // запускаем функцию
    }
  },
  playTrack,
  getMP3Metadata,
};

// * /////////////////////////////////////////

function playTrack(track, interaction) {
  const resource = createAudioResource(`${MUSIC_PATH}/` + `${track}`); // создаём папку с аудиоресурсом. "Выбрать песню в приложении"

  if (!playerState.player) {
    // если нет аудиоплеера, то создаём его
    playerState.player = createAudioPlayer(); // "Включить музыку на телефоне"
    playerState.connection.subscribe(playerState.player); // "Подключить телефон к колонкам"
  }

  playerState.player.play(resource); // "Нажать play на телефоне"
  if (playerState.queue.length - 1 > 0) {
    interaction.editReply(
      `**Сейчас играет: ${track}. Позиция в очереди: ${
        playerState.queue.index + 1
      }**`
    );
  } else interaction.editReply(`**Сейчас играет: ${track}**`);

  playerState.player.on(AudioPlayerStatus.Idle, () => {
    // если песня закончилась, то включить следующий трек в очереди, если его нет, то очищаем очередь и состояние плеера
    if (
      playerState.queue.length > 0 &&
      playerState.queue.index < playerState.queue.array.length - 1
    ) {
      playerState.nextTrack = playerState.queue.next();
      getMP3Metadata(playerState.nextTrack, interaction);
      playTrack(playerState.nextTrack, interaction);
    } else {
      playerState.isPlaying = false;
      playerState.currentTrack = null;
      playerState.queue = new ArrayNavigator([]);
    }
  });

  playerState.player.on("error", (error) => {
    // Обработка ошибок воспроизведения
    console.log("Произошла ошибка:" + ` ${error}`);
  });
}

// * ////////////////////////

function getMP3Metadata(track, interaction) {
  const files = fs.readdirSync(MUSIC_PATH); // перебираем папку

  const founder = files.filter((file) => {
    // фильтруем на название трека в нижнем регистре
    return file.toLowerCase().includes(track.toLowerCase());
  });

  if (founder.length === 0) {
    interaction.editReply(`**Трек "${track}" не найден!**`);
    return false;
  }

  const randomIndex = Math.floor(Math.random() * founder.length);

  const selectedTrack = founder[randomIndex];

  const parts = selectedTrack.replace(/^\d+\.\s*/, "").replace(/\.mp3$/i, "");
  const [authorName, songName] = parts.split(" - ").map((s) => s.trim());

  const filePath = path.join(MUSIC_PATH, selectedTrack); // создаём полный путь к треку
  const tags = NodeID3.read(filePath); // читаем полученный трек на теги

  let coverPath = "./cover.jpg";
  let def = "./default.jpg";
  let attachment;
  let url;
  if (tags.image) {
    // если обложка не найдена, то возвращаем ответ в консоль

    fs.writeFileSync(coverPath, tags.image.imageBuffer);
    attachment = new AttachmentBuilder(coverPath, { name: "cover.jpg" });
    url = "attachment://cover.jpg";
  } else {
    attachment = new AttachmentBuilder(def, { name: "default.jpg" });
    url = "attachment://default.jpg";
  }

  if (playerState.isPlaying) {
    // если песня уже играет, то передаём найденный файл в очередь
    playerState.queue.push(selectedTrack);
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(songName)
          .setAuthor({ name: "Трек добавлен!" })
          .setDescription(authorName)
          .setThumbnail(url)
          .addFields({
            name: `Добавлено в очередь`,
            value: `Позиция в очереди: ${playerState.queue.index + 1}`,
            inline: true,
          }),
      ],
      files: [attachment],
      trackName: selectedTrack,
      musicState: true,
    };
  } else {
    playerState.queue.push(selectedTrack);
  }
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(songName)
        .setAuthor({ name: "Трек добавлен!" })
        .setDescription(authorName)
        .setThumbnail(url),
    ],
    files: [attachment],
    trackName: selectedTrack,
    musicState: false,
  };
}

/*
 * // ! Разделить функцию getMP3Metadata() на несколько частей
 * // ! Отрегулировать индексирование треков
 * // ! Добавить класс PlayerState() заместо объекта состояния
 */
