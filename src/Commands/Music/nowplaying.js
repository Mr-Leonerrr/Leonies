const {Leonies: client} = require("../../Client/Leonies");
const {Message, MessageEmbed: Embed} = require("discord.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  description: "Show song name playing now.",
  group: "Music",
  memberName: "Now Playing",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   */
  callback: (message) => {
    const {guild, channel, member} = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.reply({
        embeds: [
          new Embed().setDescription("You're not on a voice channel!").setColor("RED")],
      });
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message.reply({
            embeds: [
              new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")],
          },
      ).catch((error) => console.error(error));
    }

    if (!serverQueue) return message.reply("There is no music playing!");

    let nextSong;
    if (serverQueue.songs[1] != undefined) nextSong = serverQueue.songs[1].title;
    else nextSong = "None";

    return channel.send({
          embeds: [
            new Embed().setTitle("Now Playing").
                setDescription(`[${serverQueue.songs[0].fullTitle}](${serverQueue.songs[0].url})`).
                setThumbnail(serverQueue.songs[0].thumbnail).
                addField(
                    "Duration", serverQueue.songs[0].duration, true,
                ).
                addField("Request By", serverQueue.songs[0].requestBy, true).
                setColor(9437439).
                setFooter(`Up next: ${nextSong}`)],
        },
    );

  },
};