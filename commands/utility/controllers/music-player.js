const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { playerState } = require("../classes/playerState-fs.js");
const { nav } = require("../classes/queueNavigator.js");
const { ArrayNavigator } = require("../classes/navigator.js");
const MUSIC_PATH = require("./path.js");

module.exports = {
  playTrack,
  queue,
  stopPlayer,
  prevTrackList,
  nextTrackList,
};

async function playTrack(track, interaction) {
  const resource = createAudioResource(`${MUSIC_PATH}/` + `${track}`); // создаём папку с аудиоресурсом. "Выбрать песню в приложении"
  const channel = interaction.channel;

  
  if (!playerState.player) {
    // если нет аудиоплеера, то создаём его
    playerState.player = createAudioPlayer(); // "Включить музыку на телефоне"
    playerState.connection.subscribe(playerState.player); // "Подключить телефон к колонкам"
  }

  if (playerState.queue.length - 1 > 0) {
    playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
    playerState.player.removeAllListeners("error");
  }

  if (playerState.lastMessage) {
    try {
      await playerState.lastMessage.delete();
    } catch (err) {
      if (err.code === 10008) {
        // Unknown Message
        console.warn("Сообщение уже удалено — пропускаем");
      } else {
        console.error("Ошибка при удалении сообщения:", err);
      }
    } finally {
      playerState.lastMessage = null;
    }
  }

  playerState.player.play(resource); // "Нажать play на телефоне"

  const trackName = track.replace(/^\d+\.\s*/, "").replace(/\.mp3$/i, "");

  playerState.lastMessage = await channel.send(
    `**Сейчас играет: ${trackName}**`
  );

  playerState.player.on(AudioPlayerStatus.Idle, async () => {
    // если песня закончилась, то включить следующий трек в очереди, если его нет, то очищаем очередь и состояние плеера
    if (
      playerState.queue.length > 0 &&
      playerState.queue.index < playerState.queue.array.length - 1
    ) {
      playerState.nextTrack = playerState.queue.next().name;
      await playTrack(playerState.nextTrack, interaction);
    } else {
      playerState.isPlaying = false;
      playerState.currentTrack = null;
      playerState.queue = new ArrayNavigator([]);
      
      if (playerState.lastMessage) {
        try {
          await playerState.lastMessage.delete();
      } catch (err) {
        if (err.code === 10008) {
          // Unknown Message
          console.warn("Сообщение уже удалено — пропускаем");
        } else {
          console.error("Ошибка при удалении сообщения:", err);
        }
      } finally {
        playerState.lastMessage = null;
      }
  }
    }
  });

  playerState.player.on("error", (error) => {
    console.log("Произошла ошибка:" + ` ${error}`);
  });
}

// * ////////////////////////

function stopPlayer(interaction) {
  // Останавливаем воспроизведение, если плеер активен
  if (!playerState.isPlaying)
    interaction.editReply("**Нечего останавливать!**");
  if (playerState.lastMessage) {
    try {
      playerState.lastMessage.delete();
    } catch (err) {
      if (err.code === 10008) {
        // Unknown Message
        console.warn("Сообщение уже удалено — пропускаем");
      } else {
        console.error("Ошибка при удалении сообщения:", err);
      }
    } finally {
      playerState.lastMessage = null;
    }
  }

  if (playerState.player) playerState.player.stop();
  playerState.isPlaying = false;
  playerState.currentTrack = null;
  playerState.queue = new ArrayNavigator([]);
  playerState.nextTrack = null;

  interaction.deleteReply();
}

// * ////////////////////////

async function prevTrackList(interaction) {
  if (playerState.queue.length > 0) {
    playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
    playerState.player.removeAllListeners("error");

    if (playerState.queue.index > 0) {
      playerState.nextTrack = playerState.queue.prev().name;
      await playTrack(playerState.nextTrack, interaction);
      interaction.deleteReply();
    } else {
      return interaction.editReply("**Это первый трек в списке!**");
    }
  } else {
    return interaction.editReply(`**Нет доступных треков!**`);
  }
}

// * ////////////////////////

async function nextTrackList(interaction) {
  if (playerState.queue.length > 0) {
    playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
    playerState.player.removeAllListeners("error");

    if (playerState.queue.index < playerState.queue.length - 1) {
      playerState.nextTrack = playerState.queue.next().name;
      await playTrack(playerState.nextTrack, interaction);
      interaction.deleteReply(); // удаляем скрытый ответ
    } else {
      return interaction.editReply("**Это последний трек в списке!**");
    }
  } else {
    return interaction.editReply(`**Нет доступных треков!**`);
  }
}

// * ////////////////////////

function queue(interaction) {
  try {
    console.log(`Запрос очереди`);

    const tracks = playerState.queue.array.map((track) => ({
      name: track.name,
      user: track.user,
    }));

    const num = 10;
    const pages = []; // Создаём массив для треков

    for (let i = 0; i < tracks.length; i += num) {
      const slice = tracks.slice(i, i + num);

      const page = slice
        .map((track, index) => {
          const globalIndex = i + index;
          if (globalIndex === playerState.queue.index) {
            return `**${globalIndex + 1}) ${track.name
              .replace(/^\d+\.\s*/, "")
              .replace(/\.mp3$/i, "")}. (<@${track.user}>)**`;
          } else {
            return `${globalIndex + 1}) ${track.name
              .replace(/^\d+\.\s*/, "")
              .replace(/\.mp3$/i, "")}. (<@${track.user}>)`;
          }
        })
        .join("\n\n");

      pages.push(page); // пушим массивы и наполняем pages (!!!)
    }

    nav.setPages(pages); // теперь устанавливаем страницы на основе заполненного результатом цикла массивом

    // обновляем embed внутри навигатора
    nav.embed.setDescription(nav.current());

    interaction.editReply({
      embeds: [nav.embed],
      components: [nav.pageRow],
    });
  } catch (error) {
    console.log(`Произошла ошибка при выводе очереди: ${error.message}`);
    return interaction.editReply(`**Произошла ошибка при выводе очереди!**`);
  }
}
