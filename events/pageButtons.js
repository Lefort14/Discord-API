const { Events } = require("discord.js");
const { nav, playNav } = require("../commands/utility/classes/pageNavigator");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    await interaction.deferUpdate();

    const [command, action] = interaction.customId.split("_");

    switch (command) {
      
      case "queue": {
        switch (action) {
          case "next": {
            nav.next();
            break;
          }
          case "prev": {
            nav.prev();
            break;
          }
          default:
            return;
        }
        nav.embed.setDescription(nav.current()).setTitle(`**Очередь треков:**`);

        await interaction.editReply({
          embeds: [nav.embed],
          components: [nav.pageRow],
        });

        break;
      }

      case "playList": {
        switch (action) {
          case "next": {
            playNav.next();
            break;
          }
          case "prev": {
            playNav.prev();
            break;
          }
          default:
            return;
        }
        playNav.embed
          .setDescription(playNav.current())
          .setTitle(`**Список песен:**`);

        await interaction.editReply({
          embeds: [playNav.embed],
          components: [playNav.pageRow],
        });

        break;
      }

    }
  }
};
