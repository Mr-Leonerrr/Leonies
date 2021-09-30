const {Leonies: client} = require("../../Client/Leonies");
const {Message, MessageEmbed: Embed, splitMessage} = require("discord.js");
const {getSong, getLyrics, searchSong} = require("genius-lyrics-api");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "Get lyrics of the current song.",
  group: "Music",
  memberName: "Lyrics",
  guildOnly: true,
  cooldown: 4,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: (message, args) => {
    const {guild, channel, member} = message;
    const serverQueue = client.queue.get(message.guildId);
    const voiceChannel = member.voice.channel;
    if (serverQueue && voiceChannel.id !== message.guild.me.voice.channelId) {
      return message.reply({
        embeds: [
          new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")],
      });
    }

    let options = null;
    if (!args.length) {
      if (!serverQueue) return message.reply("There is no music playing!");
      const title = serverQueue.songs[0].title;
      const artist = serverQueue.songs[0].artist;

      options = {
        apiKey: process.env.GENIUS_TOKEN,
        title: title,
        artist: artist,
        optimizeQuery: true,
      };
    } else {
      options = {
        apiKey: process.env.GENIUS_TOKEN,
        title: args.join(" "),
        artist: "",
        optimizeQuery: true,
      };
    }

    try {
      getSong(options).then((data) => {
        if (data == null)
          return channel.send({
                embeds: [
                  new Embed().setDescription("I couldn't find this song 🙁").setColor(message.guild.me.displayHexColor)],
              },
          );
        searchSong(options).then((song) => {
          getLyrics(data.url).then((lyrics) => {
            if (lyrics == null) {
              const {me} = message.guild;
              return channel.send({
                embeds: [
                  new Embed().setDescription(`No lyrics found for: ${options.title} 🙁`).
                      setColor(guild.me.displayHexColor)],
              });
            }
            const lyricsEmbed = new Embed().setColor(guild.me.displayHexColor).
                setThumbnail(data.albumArt).
                setTitle(song[0].title).
                setDescription(lyrics).
                setFooter("Powered by Genius").
                setTimestamp();

            const splitDescription = splitMessage(lyrics, {
              maxLength: 2048,
              char: "\n",
              prepend: "",
              append: "",
            });

            splitDescription.forEach(async (m) => {
              lyricsEmbed.setDescription(m);
              message.channel.send({embeds: [lyricsEmbed]});
            });
          });
        });
      });
    } catch (error) {
      channel.send(`No lyrics found for: ${options.title} 🙁`);
      console.warn(error);
    }
  },
};