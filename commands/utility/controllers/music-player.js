const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");
const { State } = require("../classes/playerState-fs.js");
const { ArrayNavigator } = require("../classes/navigator.js");
const NodeID3 = require("node-id3");
const playerState = new State();
const MUSIC_PATH = require("./path.js");
const path = require("path");
const mm = require("music-metadata");

module.exports = {
  playTrack,
  getMP3Metadata,
  embedFn,
  getTrackDuration,
  playerState,
};

async function playTrack(track, interaction) {
  const resource = createAudioResource(`${MUSIC_PATH}/` + `${track}`); // создаём папку с аудиоресурсом. "Выбрать песню в приложении"
  const channel = interaction.channel;

  if (!playerState.player) {
    // если нет аудиоплеера, то создаём его
    playerState.player = createAudioPlayer(); // "Включить музыку на телефоне"
    playerState.connection.subscribe(playerState.player); // "Подключить телефон к колонкам"
  }

  if (playerState.lastMessage) {
    playerState.lastMessage.delete();
  }

  playerState.player.play(resource); // "Нажать play на телефоне"

  const trackName = track.replace(/^\d+\.\s*/, "").replace(/\.mp3$/i, "");

  playerState.lastMessage = await channel.send(
    `**Сейчас играет: ${trackName}**`
  );

  playerState.player.on(AudioPlayerStatus.Idle, () => {
    // если песня закончилась, то включить следующий трек в очереди, если его нет, то очищаем очередь и состояние плеера
    if (
      playerState.queue.length > 0 &&
      playerState.queue.index < playerState.queue.array.length - 1
    ) {
      playerState.nextTrack = playerState.queue.next();
      playTrack(playerState.nextTrack, interaction);
    } else {
      playerState.isPlaying = false;
      playerState.currentTrack = null;
      playerState.queue = new ArrayNavigator([]);
    }
  });

  playerState.player.on("error", (error) => {
    console.log("Произошла ошибка:" + ` ${error}`);
  });
}

// * ////////////////////////////

async function getMP3Metadata(track, interaction) {
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

  const trackFullName = founder[randomIndex];

  const parts = trackFullName.replace(/^\d+\.\s*/, "").replace(/\.mp3$/i, "");
  const [authorNameRaw, songNameRaw] = parts.split(" - ").map((s) => s.trim());
  const songName = songNameRaw || "Без названия";
  const authorName = authorNameRaw || "Неизвестный автор";

  const filePath = path.join(MUSIC_PATH, trackFullName); // создаём полный путь к треку
  const tags = NodeID3.read(filePath); // читаем полученный трек на теги

  const time = await getTrackDuration(filePath);

  let coverPath = "./cover.jpg";
  let def = "./default.jpg";
  let attachment;
  let url;
  if (tags.image) {
    fs.writeFileSync(coverPath, tags.image.imageBuffer);
    attachment = new AttachmentBuilder(coverPath, { name: "cover.jpg" });
    url = "attachment://cover.jpg";
  } else {
    attachment = new AttachmentBuilder(def, { name: "default.jpg" });
    url = "attachment://default.jpg";
  }
  return {
    trackFullName: trackFullName,
    songName: songName,
    authorName: authorName,
    time: time,
    url: url,
    files: [attachment],
  };
}

// * ///////////////////////

async function embedFn(trackFullName, songName, authorName, time, url, files) {
  if (playerState.isPlaying) {
    // если песня уже играет, то передаём найденный файл в очередь
    playerState.queue.push(trackFullName);
  } else playerState.queue.push(trackFullName);
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(songName || "Без названия")
        .setAuthor({
          name: playerState.isPlaying
            ? "Трек добавлен в очередь!"
            : "Трек добавлен!",
        })
        .setDescription(authorName || "Неизвестный автор")
        .setThumbnail(url)
        .addFields({
          name: `Длительность`,
          value: time ? time : "00:00",
          inline: true,
        }),
    ],
    files: files,
  };
}

// * ////////////////////////

async function getTrackDuration(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("Файл не найден:", filePath);
      return "00:00";
    }

    const metadata = await mm.parseFile(filePath);
    const duration = metadata?.format?.duration;

    if (!duration || isNaN(duration)) return "00:00";

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
  } catch (error) {
    console.error(
      `Ошибка при чтении длительности (${filePath}):`,
      error.message
    );
    return "00:00";
  }
}
