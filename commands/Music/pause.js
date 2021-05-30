require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "pause",
  aliases: ["pause-song", "hold", "ps"],
  description: "Pause the currently playing music.",
  group: "Music",
  memberName: "Pause",
  guildOnly: true,
  cooldown: 3,
  callback: (message) => {
    const { client, guild, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You're not on a voice channel!").setColor("RED")
      );
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message.inlineReply(
        new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")
      );
    }

    if (!serverQueue) return message.inlineReply("There is no music playing!");

    if (serverQueue.connection.dispatcher.paused)
      return message.inlineReply(
        new Embed().setDescription("The song is already paused").setColor("ORANGE")
      );

    message.react("⏸");
    serverQueue.connection.dispatcher.pause();
  },
};
