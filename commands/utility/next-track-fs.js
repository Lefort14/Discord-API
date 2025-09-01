const { SlashCommandBuilder } = require('discord.js')
const { AudioPlayerStatus } = require('@discordjs/voice')
const playerState = require('./state/playerState-fs.js')
const { playTrack, trackEmitter } = require('./music-fs.js')

const trackEmitterNext = trackEmitter

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
      }
    }
}

function nextTrackList(interaction) {
    if(playerState.isPlaying && playerState.queue.length > 0) {
      playerState.player.removeAllListeners(AudioPlayerStatus.Idle);
      playerState.player.removeAllListeners('error');      
      if(playerState.queue.index < playerState.queue.length - 1) {
        playerState.nextTrack = playerState.queue.next()
        playTrack(playerState.nextTrack, interaction)
      } else {
        return interaction.editReply('**Это последний трек в списке!**')
      }
    } else {
      return interaction.editReply(`**Нет доступных треков!**`)
      }
}