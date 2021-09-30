const { Util, Message } = require("discord.js");

module.exports = {
  name: "say",
  description: "I will repeat what you say.",
  usage: "<your message>",
  group: "Fun",
  memberName: "Say",
  clientPerms: ["MANAGE_MESSAGES"],
  args: true,
  guildOnly: true,
  cooldown: 5,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: (message, args) => {
    message.channel.send(Util.removeMentions(args.join(" ")));
    message.delete();
  },
};
