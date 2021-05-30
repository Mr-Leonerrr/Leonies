const { MessageEmbed: Embed, splitMessage } = require("discord.js");
const { getSong, getLyrics, searchSong } = require("genius-lyrics-api");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "Get lyrics of the current song.",
  group: "Music",
  memberName: "Lyrics",
  guildOnly: true,
  cooldown: 4,
  callback: (message, args) => {
    const { client, guild, channel, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message.inlineReply(
        new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")
      );
    }

    let options = null;
    if (!args.length) {
      if (!serverQueue) return message.inlineReply("There is no music playing!");
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
          return channel.send(
            new Embed().setDescription("I couldn't find this song 🙁").setColor(guild.me.displayHexColor)
          );
        searchSong(options).then((song) => {
          getLyrics(data.url).then((lyrics) => {
            if (lyrics == null)
              return channel.send(
                new Embed()
                  .setDescription(`No lyrics found for: ${options.title} 🙁`)
                  .setColor(guild.me.displayHexColor)
              );
            const lyricsEmbed = new Embed()
              .setColor(guild.me.displayHexColor)
              .setThumbnail(data.albumArt)
              .setTitle(song[0].title)
              .setDescription(lyrics)
              .setFooter("Powered by Genius")
              .setTimestamp();

            const splitDescription = splitMessage(lyrics, {
              maxLength: 2048,
              char: "\n",
              prepend: "",
              append: "",
            });

            splitDescription.forEach(async (m) => {
              lyricsEmbed.setDescription(m);
              message.channel.send(lyricsEmbed);
            });
          });
        });
      });
    } catch (error) {
      channel.send(`No lyrics found for: ${options.title} 🙁`);
      console.warn(err);
    }
  },
};
