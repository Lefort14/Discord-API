const { Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { ArrayNavigator } = require("../commands/utility/classes/arrayNavigator.js");
const {
  playerState,
} = require("../commands/utility/classes/playerState-fs.js");

const logsPath = path.join(__dirname, "logs.txt");

const date = () => {
  const date = new Date(Date.now());
  return date.toLocaleString();
};

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute(oldState, newState) {
    try {
      // Проверяем, что это состояние нашего бота
      if (oldState.member.id !== oldState.client.user.id) return;

      // Бот вышел из канала (самостоятельно или принудительно)
      if (oldState.channelId && !newState.channelId) {
        console.log("Бот вышел из голосового канала!");
        fs.writeFile(
          logsPath,
          `[${date()}] Бот вышел из голосового канала!` + "\n",
          { flag: "a" },
          (err) => {
            if (err) throw err;
          }
        );
        cleanPlayer();
      }
      // Бот был перемещен в другой канал
      else if (
        oldState.channelId &&
        newState.channelId &&
        oldState.channelId !== newState.channelId
      ) {
        console.log("Бот был перемещен в другой канал!");
        fs.writeFile(
          logsPath,
          `[${date()}] Бот был перемещен в другой канал!` + "\n",
          { flag: "a" },
          (err) => {
            if (err) throw err;
          }
        );
        cleanPlayer();
      }
    } catch (error) {
      console.log("Произошла ошибка:" + ` ${error}`);
    }
  },
};

function cleanPlayer() {
  // Останавливаем воспроизведение, если плеер активен
  if (playerState.player) playerState.player.stop();

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

  playerState.connection = null;
  playerState.player = null;
  playerState.isPlaying = false;
  playerState.currentTrack = null;
  playerState.queue = new ArrayNavigator([]);
  playerState.nextTrack = null;
}
