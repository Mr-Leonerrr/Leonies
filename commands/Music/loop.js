require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "loop",
  aliases: ["lp"],
  description: "Repeat the current song or queue.",
  usage: "[all | one | off]",
  group: "Music",
  memberName: "Loop",
  guildOnly: true,
  cooldown: 3,
  callback: (message, args) => {
    const { client, guild, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You're not on a voice channel!").setColor("RED")
      );
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message
        .inlineReply(
          new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")
        )
        .catch((error) => console.error(error));
    }

    if (!serverQueue) return message.inlineReply("There is no music playing!");

    if (!args.length) {
      serverQueue.loopall = !serverQueue.loopall;
      serverQueue.loopone = false;

      if (serverQueue.loopall === true) {
        message.react("🔁");
      } else {
        message.inlineReply(
          new Embed().setDescription("Loop all has been `turned off!`").setColor("ORANGE")
        );
      }
    } else {
      switch (args[0].toLowerCase()) {
        case "all":
          serverQueue.loopall = !serverQueue.loopall;
          serverQueue.loopone = false;

          if (serverQueue.loopall === true) {
            message.react("🔁");
          } else {
            message.inlineReply(
              new Embed().setDescription("Loop all has been `turned off!`").setColor("ORANGE")
            );
          }
          break;

        case "one":
          serverQueue.loopone = !serverQueue.loopone;
          serverQueue.loopall = false;

          if (serverQueue.loopone === true) {
            message.react("🔂");
          } else {
            message.inlineReply(
              new Embed().setDescription("Loop one has been `turned off!`").setColor("ORANGE")
            );
          }
          break;

        case "off":
          serverQueue.loopall = false;
          serverQueue.loopone = false;

          message.channel.send(
            new Embed().setDescription("Loop has been `turned off`!").setColor("ORANGE")
          );
          break;
      }
    }
  },
};
