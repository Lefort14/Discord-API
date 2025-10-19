const { SlashCommandBuilder } = require('discord.js')
const { playList } = require('./controllers/get-music-data')
const fs = require("fs");
const MUSIC_PATH = require('./controllers/path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Показывает список песен!'),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true })

            await playList(interaction)
        } catch (error) {
            console.log("Произошла ошибка:" + ` ${error}`);
            console.error(error);
            return interaction.editReply("**Произошла ошибка!**");
        }    
    }
}