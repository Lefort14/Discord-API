const { Events } = require("discord.js");
const fs = require("fs");
const playerState = require("../commands/utility/state/playerState-fs.js");
const path = require('path');
const { ArrayNavigator } = require("../commands/utility/state/navigator.js");

const logsPath = path.join(__dirname, 'logs.txt') 

const date = () => {
    const date = new Date(Date.now())
    return date.toLocaleString()
}

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute(oldState, newState) { 
        
        try {
            // Проверяем, что это состояние нашего бота
            if (oldState.member.id !== oldState.client.user.id) return;
            
            // Бот вышел из канала (самостоятельно или принудительно)
            if (oldState.channelId && !newState.channelId) {
                console.log('Бот вышел из голосового канала!');
                fs.writeFile(logsPath, `[${date()}] Бот вышел из голосового канала!` + '\n', { flag: 'a' }, (err) => {
                    if (err) throw err; 
                });
                cleanPlayer();
            }
            // Бот был перемещен в другой канал
            else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                console.log('Бот был перемещен в другой канал!');
                fs.writeFile(logsPath, `[${date()}] Бот был перемещен в другой канал!` + '\n', { flag: 'a' }, (err) => {
                    if (err) throw err; 
                });
                cleanPlayer();
            }
        } catch (error) {
            console.log('Произошла ошибка:' + ` ${error}`);  
        }
    }
}

function cleanPlayer() {
    // Останавливаем воспроизведение, если плеер активен
    if (playerState.player) {
        playerState.player.stop();
    }
    
    playerState.connection = null;
    playerState.player = null;
    playerState.isPlaying = false;
    playerState.currentTrack = null;
    playerState.queue = new ArrayNavigator([]);
    playerState.nextTrack = null;
}