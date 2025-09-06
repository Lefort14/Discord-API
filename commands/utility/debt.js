const { SlashCommandBuilder } = require('discord.js')
require('dotenv').config();
const url = process.env.FETCH_URL;

const debt = new SlashCommandBuilder()
.setName('debt')
.setDescription('показывает долги!')
.addStringOption(option => 
    option
    .setName('debts')
    .setDescription('debts category')
    .setRequired(true)
    .addChoices(
        { name: 'One debt', value: 'Mdebt' },
        { name: 'Two debt', value: 'Ddebt' }
))

module.exports = {
    data: debt,
    async execute(interaction) {
        const response = await fetch(url);
        const rawText = await response.text();
        const choice = interaction.options.getString('debts')
            
        // Обработка ответа Google Sheets
        const jsonString = rawText.match(/google\.visualization\.Query\.setResponse\((.+)\)/)[1];
        const data = JSON.parse(jsonString);
        
        // Извлекаем данные таблицы
        const rows = data.table.rows.map(row => {
            return row.c.map(cell => cell ? cell.v : null);
        });
        
        console.log(`Данные таблицы: ${rows[0].join(' ')}`);

        let message = '';
        rows.forEach(row => {
            if(choice === 'Mdebt') {
            message += `** Первый долг: ${row[0]} ₽**`
            }
            if (choice === 'Ddebt') {
            message += `** Второй долг: ${row[1]} ₽**`
            }
        });

        
        await interaction.reply(message);
    }
}