const { LOCALE } = require("../../util/LeoncitoUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "pause",
  aliases: ["ps", "pause-song", "hold"],
  description: i18n.__("pause.description"),
  group: "Music",
  memberName: "Pause",
  cooldown: 3,
  guildOnly: true,
  callback: (message) => {
    const serverQueue = message.client.queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You're not in the voice channel!",
          color: 16515072,
        },
      });

    if (voiceChannel !== message.guild.me.voice.channel) {
      return message.reply(
        "⛔ You must be in the same voice channel as the bot's in order to use that!"
      );
    }

    if (!serverQueue) return message.channel.send(i18n.__mf("pause.errorNotQueue"));

    if (serverQueue.connection.dispatcher.paused)
      return message.channel.send("The song is already paused");

    if (message.member.voice.channel.id !== message.guild.me.voice.channel.id)
      return message.reply(
        `⛔ You must be in the same voice channel as the bot's in order to use that!`
      );

    message.react("⏸");
    serverQueue.connection.dispatcher.pause();
  },
};
