module.exports = {
  name: "purge",
  description: "Delete the messages in the chat.",
  aliases: ["clear", "pg"],
  usage: "[number of messages]",
  async execute(client, message) {
    const args = message.content.split(" ");
    let deleteCount = 0;
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message
        .reply("You don't have permissions to use this command!")
        .then((msg) => {
          msg.delete(3000);
        });
    } else {
      try {
        deleteCount = parseInt(args[1], 10);
      } catch (err) {
        return message.reply(
          "Enter the number of messages to delete. (max 100)"
        );
      }

      if (!deleteCount || deleteCount < 2 || deleteCount > 100)
        return message.reply(
          "Enter a number between 2 and 100 for the number of messages you want to delete."
        );

      const fetched = await message.channel.messages.fetch({
        limit: deleteCount,
      });
      message.channel
        .bulkDelete(fetched)
        .catch((error) =>
          message.reply(`Messages could not be deleted due to: ${error}`)
        );
      message
        .reply(`Messages have been deleted successfully 💥.`)
        .then((msg) => {
          msg.delete({ timeout: 3000 });
        })
        .catch(console.error);
    }
  },
};
