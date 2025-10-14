const { Events } = require("discord.js");
const { nav } = require('../commands/utility/classes/queueNavigator')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    await interaction.deferUpdate();

    switch (interaction.customId) {
      case "next_page": {
        nav.next();
        break;
      }
      case "prev_page": {
        nav.prev();
        break;
      }
      default:
        return;
    }
    
    nav.embed.setDescription(nav.current());

    await interaction.editReply({
      embeds: [nav.embed],
      components: [nav.pageRow],
    });
  },
};