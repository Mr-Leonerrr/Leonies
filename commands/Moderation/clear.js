require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["purge", "cl", "pg"],
  description: "Delete a number of messages on the channel.",
  usage: "<number of messages>",
  group: "Moderation",
  memberName: "Clear",
  args: true,
  guildOnly: true,
  cooldown: 3,
  callback: async (message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      return message
        .inlineReply("You don't have permissions to use this command!")
        .then((msg) => msg.delete({ timeout: 3000 }));
    } else {
      const amount = parseInt(args[0]) + 1;
      if (isNaN(amount)) {
        return message.reply("That doesn't seem to be a number.");
      } else if (amount < 1 || amount > 100) {
        return message.reply("Please enter a number between 1 and 99.");
      }

      message.channel
        .bulkDelete(amount, true)
        .then((deletedMessages) => {
          let botMessages = deletedMessages.filter((msg) => msg.author.bot);
          let userMessages = deletedMessages.filter((msg) => !msg.author.bot);

          const embed = new Embed()
            .setTitle("Deleted")
            .setColor(0x00ae86)
            .setThumbnail("https://img.icons8.com/plasticine/2x/26e07f/full-trash.png")
            .addFields(
              { name: "Deleted bot messages", value: botMessages.size },
              { name: "Deleted user messages", value: userMessages.size }
            )
            .setTimestamp();

          message.channel.send(embed).then((msg) => msg.delete({ timeout: 3000 }));
        })
        .catch((error) => {
          console.error(error);
          message.channel.send("An error occurred while trying to delete messages from this channel!");
        });
    }
  },
};
