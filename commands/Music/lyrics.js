const { MessageEmbed: Embed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const { LOCALE } = require("../../util/LeoncitoUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "lyrics",
  description: i18n.__("lyrics.description"),
  aliases: ["ly"],
  group: "Music",
  memberName: "Lyrics",
  guildOnly: true,
  callback: async (message) => {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send(i18n.__("lyrics.errorNotQueue")).catch(console.error);

    let lyrics = null;
    const title = serverQueue.songs[0].title;
    try {
      lyrics = await lyricsFinder(serverQueue.songs[0].title, "");
      if (!lyrics) lyrics = i18n.__mf("lyrics.lyricsNotFound", { title: title });
    } catch (error) {
      lyrics = i18n.__mf("lyrics.lyricsNotFound", { title: title });
    }

    let lyricsEmbed = new Embed()
      .setTitle(i18n.__mf("lyrics.embedTitle", { title: title }))
      .setDescription(lyrics)
      .setColor("#F8AA2A")
      .setTimestamp();

    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return message.channel.send(lyricsEmbed).catch(console.error);
  },
};
