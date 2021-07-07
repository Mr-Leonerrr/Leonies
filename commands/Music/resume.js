const { Message, MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "resume",
  aliases: ["r", "resume-song", "continue"],
  description: "Resume the current paused song.",
  group: "Music",
  memberName: "Resume",
  guildOnly: true,
  cooldown: 5,
  /**
   * @param {Message} message
   */
  callback: (message) => {
    const { client, guild, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
      );
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message
        .inlineReply(`You must be in the same channel as ${client.user}`)
        .catch((error) => console.error(error));
    }

    if (!serverQueue) return message.inlineReply("There is nothing playing.");

    if (serverQueue.connection.dispatcher.resumed)
      return message.inlineReply("The song is already playing!");

    message.react("▶");
    serverQueue.connection.dispatcher.resume();
  },
};
