const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js') 


module.exports = {
    data: new SlashCommandBuilder()
    .setName('bbutton')
    .setDescription('показывает кнопки!'),
    async execute(interaction) {
        
        await interaction.deferReply()

        const row = new ActionRowBuilder()

        row.addComponents(
        new ButtonBuilder()
            .setCustomId('click')
            .setLabel('click')
            .setStyle(ButtonStyle.Secondary)
        )

        const musicObj = {
            components: [row]
            }
        
        await interaction.editReply(musicObj)

    }
}

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        await interaction.deferReply()

        if(!interaction.isButton() || interaction.customId !== 'click') {
            return
        }
        interaction.editReply('Hello!')

    }
}