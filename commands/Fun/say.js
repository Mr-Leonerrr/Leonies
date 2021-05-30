const { Util } = require("discord.js");

module.exports = {
  name: "say",
  description: "I will repeat what you say.",
  usage: "<your message>",
  group: "Fun",
  memberName: "Say",
  args: true,
  guildOnly: true,
  cooldown: 5,
  callback: (message, args) => {
    message.channel.send(Util.removeMentions(args.join(" ")));
    message.delete();
  },
};
