const { MessageEmbed: Embed } = require("discord.js");
const { LOCALE } = require("../../util/LeoncitoUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "loop",
  description: i18n.__("loop.description"),
  aliases: ["lp"],
  group: "Music",
  memberName: "Loop",
  usage: "[all/one/off]",
  cooldown: 3,
  guildOnly: true,
  callback: (message, args) => {
    const serverQueue = message.client.queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You are not in the voice channel!",
          color: 16515072,
        },
      });
    }
    if (!message.guild.me.voice.channel) {
      return message.reply("I'm not on a voice channel!");
    }
    if (voiceChannel != message.guild.me.voice.channel)
      return message.reply(
        `⛔ You must be in the same voice channel as the bot's in order to use that!`
      );
    if (!serverQueue) return message.channel.send("There is no music playing!");

    if (!args.length) {
      serverQueue.loopall = !serverQueue.loopall;
      serverQueue.loopone = false;

      if (serverQueue.loopall === true) {
        message.react("🔁");
      } else {
        message.reply("Loop all has been `turned off!`");
      }
    } else {
      switch (args[0].toLowerCase()) {
        case "all":
          serverQueue.loopall = !serverQueue.loopall;
          serverQueue.loopone = false;

          if (serverQueue.loopall === true) {
            message.react("🔁");
          } else {
            message.reply("Loop all has been `turned off!`");
          }
          break;

        case "one":
          serverQueue.loopone = !serverQueue.loopone;
          serverQueue.loopall = false;

          if (serverQueue.loopone === true) {
            message.react("🔂");
          } else {
            message.reply("Loop one has been `turned off!`");
          }
          break;

        case "off":
          serverQueue.loopall = false;
          serverQueue.loopone = false;

          message.channel.send("Loop has been `turned off`!");
          break;
      }
    }
  },
};
