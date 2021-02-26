module.exports = {
  name: "nowplaying",
  description: "Show song name playing now.",
  aliases: ["np"],
  execute(client, message, args, queue) {
    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You are not in the voice channel!",
          color: 16515072,
        },
      });
    if (voiceChannel !== message.guild.me.voice.channel) {
      return message.reply(
        `⛔ You must be in the same voice channel as the bot's in order to use that!`
      );
    }
    if (!serverQueue)
      return message.channel.send("There is no music currently playing!");

    let nextSong;
    if (serverQueue.songs[1] != undefined)
      nextSong = serverQueue.songs[1].title;
    else nextSong = "None";

    return message.channel.send({
      embed: {
        title: "Now Playing",
        description: `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`,
        thumbnail: {
          url: serverQueue.songs[0].thumbnail,
        },
        color: 9437439,
        fields: [
          {
            name: "Duration",
            value: serverQueue.songs[0].duration,
            inline: true,
          },
          {
            name: "Request By",
            value: `[${message.member.user}]`,
            inline: true,
          },
        ],
        footer: { text: `Upnext: ${nextSong}` },
      },
    });
  },
};
