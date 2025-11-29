const { Events } = require('discord.js');
const fs = require('fs');

const date = () => {
    const date = new Date(Date.now())
    return date.toLocaleString()
}

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute(oldState, newState) {
        if(oldState.channelId !== newState.channelId) {
            
            if(!oldState.channel && newState.channel) {
                console.log(`[${date()}] ${newState.member.user.username} зашёл в ${newState.channel.name}`)
            
                fs.writeFile('./events/logs.txt', `[${date()}] ${newState.member.user.username} зашёл в ${newState.channel.name}` + '\n', { flag: 'a' }, (err) => {
                    if (err) throw err; 
                })
            }
        
            if(oldState.channel && !newState.channel) {
                console.log(`[${date()}] ${newState.member.user.username} вышел из ${oldState.channel.name}`)
            
                fs.writeFile('./events/logs.txt', `[${date()}] ${newState.member.user.username} вышел из ${oldState.channel.name}` + '\n', { flag: 'a' }, (err) => {
                    if (err) throw err; 
                })
            }

            if(oldState.channel && newState.channel) {
                console.log(`[${date()}] ${newState.member.user.username} перешёл из ${oldState.channel.name} в ${newState.channel.name}`)
            
                fs.writeFile('./events/logs.txt', `[${date()}] ${newState.member.user.username} перешёл из ${oldState.channel.name} в ${newState.channel.name}` + '\n', { flag: 'a' }, (err) => {
                    if (err) throw err; 
                })
            }
        }
    }
}
