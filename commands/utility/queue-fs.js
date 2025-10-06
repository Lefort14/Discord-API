const { SlashCommandBuilder, messageLink } = require('discord.js')
const { playerState } = require('./controllers/music-player')
const { AudioPlayerStatus } = require("@discordjs/voice");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Показывает очередь треков'),
        async execute(interaction) {
            try {
              await interaction.deferReply()
               
              if (!interaction.member.voice.channel) {
                return interaction.editReply("**Ты не можешь просмотреть, так как ты не в голосовом чате!**");
              }
              
              if(!interaction.member.voice.channel) {
                interaction.editReply("**зайди в голосовой чат!**");
              }
              
              if (playerState.queue.length === 0) {
                return interaction.editReply("**Нет очереди треков!**");
            }
            
            if (!interaction.guild.members.me.voice.channelId) {
              return interaction.editReply("**Бот не в голосовом чате!**");
            }
            
            if(playerState.queue.length > 0) {
              queue(interaction)
            } else {
              return interaction.editReply('**Нет активной очереди треков!**')
            }
            
          } catch (error) {
            console.log('Произошла ошибка:' + ` ${error}`);
            console.error(error)
            return interaction.editReply('**Произошла ошибка!**')
            }
        },
  queue: queue
}

function queue(interaction) {
  console.log(`Запрос очереди`)
  const result = playerState.queue.array.map((track, index) => {
    if(index === playerState.queue.index) {
      return `**${index + 1}) ${track.toUpperCase()}**`
    } else return `${index + 1}) ${track}`
  }).join('\n')
    
  playerState.player.on(AudioPlayerStatus.Idle, () => { // выделяет трек, который уже закончился, хотя уже играет следующий
    if(playerState.isPlaying && playerState.queue.length > 0) {
      queue(interaction)
    } else return
  })

  return interaction.editReply(`**Очередь треков:**\n${result}`);
}
