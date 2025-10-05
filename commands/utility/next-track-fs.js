const { SlashCommandBuilder } = require('discord.js')
const { AudioPlayerStatus } = require('@discordjs/voice')
const { playTrack, playerState } = require('./controllers/music-player.js')



module.exports = {
    data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Переключает на следующий трек!'),
    async execute(interaction) {
        
        await interaction.deferReply()

        if (!interaction.member.voice.channel) {
            return interaction.editReply("**Ты не можешь переключить на следующий трек, так как ты не в голосовом чате!**");
          }

        if(!interaction.member.voice.channel) {
            interaction.editReply(`зайди в голосовой чат!`);
          }

        if (!playerState.player) {
            return interaction.editReply("**Нет активного воспроизведения!**");
        }

        if (!interaction.guild.members.me.voice.channelId) {
            return interaction.editReply("**Бот не в голосовом чате!**");
          }
        
      try {
        nextTrackList(interaction) 
      } catch (error) {
        console.log('Произошла ошибка:' + ` ${error}`);
        return interaction.editReply('**Произошла ошибка!**')
      }
    }
}

async function nextTrackList(interaction) {
    if(playerState.queue.length > 0) {
      
      playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
      playerState.player.removeAllListeners('error');      
      
      if(playerState.queue.index < playerState.queue.length - 1) {
        
        playerState.nextTrack = playerState.queue.next()
        playTrack(playerState.nextTrack, interaction)
        await interaction.deleteReply(); // удаляем скрытый ответ
      } else {
        return interaction.editReply('**Это последний трек в списке!**')
      }
    } else {
      return interaction.editReply(`**Нет доступных треков!**`)
      }
}