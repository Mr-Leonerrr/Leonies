const { MessageEmbed: Embed } = require("discord.js");

const answers = [
  "Yes, definitely so.",
  "It is certain.",
  "Signs point to yes.",
  "No, definitely not.",
  "Ask again later.",
  "It is uncertain.",
  "Odds are not in your favor.",
];

module.exports = {
  name: "8ball",
  description: "8-Ball reaches into the future, to find the answers to your questions.",
  aliases: ["8b", "ball"],
  usage: "[question]",
  group: "Utility",
  memberName: "8 Ball",
  cooldown: 3,
  guildOnly: true,
  callback: async (message, args) => {
    if (!args.length) {
      return await message.delete().then(() => {
        message.channel.send("Please ask a full question.");
      });
    }
    console.log("question");
    let embed = new Embed()
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .addField(`Question`, args);

    let number = Math.floor(Math.random() * answers.length);

    //Answer 1
    if (number == 0) {
      embed.addField(`Answer`, answers[1]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 2
    if (number == 1) {
      embed.addField(`Answer`, answers[2]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 3
    if (number == 2) {
      embed.addField(`Answer`, answers[3]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 4
    if (number == 3) {
      embed.addField(`Answer`, answers[4]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 5
    if (number == 4) {
      embed.addField(`Answer`, answers[5]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 6
    if (number == 5) {
      embed.addField(`Answer`, answers[6]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }

    //Answer 7
    if (number == 6) {
      embed.addField(`Answer`, answers[7]);
      return await message.delete().then(() => {
        message.channel.send(embed);
      });
    }
  },
};
