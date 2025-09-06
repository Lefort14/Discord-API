const { SlashCommandBuilder } = require('discord.js')
const { AudioPlayerStatus } = require('@discordjs/voice')
const playerState = require('./state/playerState-fs.js')
const { playTrack } = require('./music-fs.js')
const { queue } = require('./queue-fs.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('prev')
    .setDescription('Переключает на предыдущий трек!'),
    async execute(interaction) {
        
        await interaction.deferReply()

        if (!interaction.member.voice.channel) {
            return interaction.editReply("**Ты не можешь переключить на предыдущий трек, так как ты не в голосовом чате!**");
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
        prevTrackList(interaction) 
      } catch (error) {
        console.log('Произошла ошибка:' + ` ${error}`);
        return interaction.editReply('**Произошла ошибка!**')
      }
    }
}

function prevTrackList(interaction) {
    if(playerState.queue.length > 0) {
      playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
      playerState.player.removeAllListeners('error');
      if(playerState.queue.index > 0) {   
        playerState.nextTrack = playerState.queue.prev()
        playTrack(playerState.nextTrack, interaction)
      } else {
        return interaction.editReply('**Это первый трек в списке!**')
      }
    } else {
      return interaction.editReply(`**Нет доступных треков!**`)
      }
}