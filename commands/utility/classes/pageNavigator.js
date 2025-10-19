const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

class PageNavigator {
  constructor() {
    this.pageRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setEmoji("◀")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setEmoji("▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
      )
    
    this.btnI = 0;
    
    this.result = [];
    
    this.embed = new EmbedBuilder()
        .setDescription(`${this.result[this.btnI]}`);
    
  }

  setPages(pages) {
    this.result = pages; 
    this.btnI = 0;

    this.pageRow.components[0].setDisabled(true);
    this.pageRow.components[1].setDisabled(this.result.length <= 1);
  }

  next() {
    if (this.btnI < this.result.length - 1) this.btnI++;
    this.updateButtons();
    return this.current();
  }

  prev() {
    if (this.btnI > 0) this.btnI--;
    this.updateButtons();
    return this.current();
  }

  current() {
    return this.result[this.btnI] ?? "Страница не найдена.";
  }

  updateButtons() {
    this.pageRow.components[0].setDisabled(this.btnI === 0);
    this.pageRow.components[1].setDisabled(this.btnI === this.result.length - 1);
  }
}

const nav = new PageNavigator()
const playNav = new PageNavigator()

module.exports = { nav, playNav };

// * Нужно вручную устанавливать .setTitle, .setDescription для embed и .setCustomId для pageRow