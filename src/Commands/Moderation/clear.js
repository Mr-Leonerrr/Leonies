const { MessageEmbed: Embed, Message, TextChannel } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["purge", "cl", "pg"],
  description: "Delete a number of messages on the channel.",
  usage: "<number of messages>",
  group: "Moderation",
  memberName: "Clear",
  clientPerms: ["MANAGE_MESSAGES"],
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    /**
     * @type {TextChannel}
     */
    const channel = message.channel;
    if (!message.member.permissions.has("MANAGE_MESSAGES")) {
      return message
        .reply("You don't have permissions to use this command!")
        .then((msg) => setTimeout(() => msg.delete(), 3000));
    } else {
      const amount = parseInt(args[0]) + 1;
      if (isNaN(amount)) {
        return message.reply("That doesn't seem to be a number.");
      } else if (amount < 1 || amount > 100) {
        return message.reply("Please enter a number between 1 and 99.");
      }

      channel
        .bulkDelete(amount, true)
        .then((deletedMessages) => {
          const botMessages = deletedMessages.filter((msg) => msg.author.bot);
          const userMessages = deletedMessages.filter((msg) => !msg.author.bot);

          const embed = new Embed()
            .setTitle("Deleted")
            .setColor(0x00ae86)
            .setThumbnail("https://img.icons8.com/plasticine/2x/26e07f/full-trash.png")
            .addField("Deleted bot messages", botMessages.size)
            .addField("Deleted user messages", userMessages.size)
            .setTimestamp();

          channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 3000));
        })
        .catch((error) => {
          console.error(error);
          channel.send("An error occurred while trying to delete messages from this channel!");
        });
    }
  },
};
