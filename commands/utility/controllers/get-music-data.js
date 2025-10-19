const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const { playerState } = require("../classes/playerState-fs.js");
const NodeID3 = require("node-id3");
const MUSIC_PATH = require("./path.js");
const path = require("path");
const mm = require("music-metadata");
const { playNav } = require("../classes/pageNavigator.js");

module.exports = {
  getMP3Metadata,
  embedFn,
  playList,
};

async function getMP3Metadata(track, interaction) {
  const files = fs.readdirSync(MUSIC_PATH); // перебираем папку

  const founder = files.filter((file) => {
    // фильтруем на название трека в нижнем регистре
    return file.toLowerCase().includes(track.toLowerCase());
  });

  if (!founder[0].toLowerCase().endsWith('.mp3')) {
  await interaction.editReply('**Найденный файл не в .mp3 формате!**');
  return false;
  }

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

async function embedFn(songName, authorName, time, url, files) {
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

// * /////////////////

async function playList(interaction) {
  try {
    console.log(`Запрос списка треков`);

    const files = fs.readdirSync(MUSIC_PATH).filter(file => file.toLowerCase().endsWith('.mp3'))
    const pages = [];
    const num = 20;

    for (let i = 0; i < files.length; i += num) {
      const slice = files.slice(i, i + num);

      const page = slice
        .map((track) => {
          return `${track.replace(/\.mp3$/i, "")}`;
        })
        .join("\n\n");

      pages.push(page);
    }

    playNav.setPages(pages);

    playNav.embed
      .setDescription(playNav.current())
      .setTitle(`**Список песен:**`);

    playNav.pageRow.components[0].setCustomId("playList_prev_page");
    playNav.pageRow.components[1].setCustomId("playList_next_page");

    await interaction.editReply({
      embeds: [playNav.embed],
      components: [playNav.pageRow],
    });
  } catch (error) {
    console.log(`Произошла ошибка при выводе очереди: ${error.message}`);
    return interaction.editReply(
      `**Произошла ошибка при выводе листа треков!**`
    );
  }
}
