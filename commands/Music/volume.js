const { LOCALE } = require("../../util/LeoncitoUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "volume",
  description: i18n.__("volume.description"),
  aliases: ["vol", "v"],
  usage: "[volume]",
  group: "Music",
  memberName: "Volume",
  cooldown: 3,
  guildOnly: true,
  callback: (message, args) => {
    if (!message.member.voice)
      return message.channel.send("I'm sorry but you need to be in a voice channel to play music!");
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!args[0]) return message.channel.send(`The current volume is: **${serverQueue.volume}%**`);
    serverQueue.volume = args[0]; // eslint-disable-line
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 80);
    return message.channel.send(`I set the volume to: **${args[0]}%**`);
  },
};
