const { MessageEmbed: Embed, Message } = require("discord.js");

const answers = [
  "Yes.",
  "As I see it, yes.",
  "Yes, definitely so.",
  "It is certain.",
  "Signs point to yes.",
  "Better not tell you now.",
  "No, definitely not.",
  "Ask again later.",
  "It is uncertain.",
  "My reply is no.",
  "My sources say no.",
  "Don’t count on it.",
  "Odds are not in your favor.",
  "Cannot predict now.",
];

module.exports = {
  name: "8ball",
  aliases: ["ball", "8b"],
  description: "8-Ball reaches into the future, to find the answers to your questions.",
  usage: "<question>",
  group: "Fun",
  memberName: "8 Ball",
  clientPerms: ["MANAGE_MESSAGES"],
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { channel, author } = message;
    if (!args.length) {
      return message.delete().then(() => {
        channel.send("Please ask a full question.");
      });
    }

    const embed = new Embed()
      .setAuthor(author.username, author.displayAvatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .addField("Question", args.join(" "));

    let number = Math.floor(Math.random() * answers.length);
    message
      .delete()
      .then(() => channel.send({ embeds: [embed.addField(":8ball: says", answers[number])] }));
  },
};
