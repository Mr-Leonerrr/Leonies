const { Message, MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "stop",
  aliases: ["sp", "s"],
  description: "Stop and clear the current queue.",
  group: "Music",
  memberName: "Stop",
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
        .inlineReply(
          new Embed()
            .setDescription(`You must be in the same channel as ${client.user}`)
            .setColor("RED")
        )
        .catch((error) => console.error(error));
    }

    if (!serverQueue) {
      return message.inlineReply(
        new Embed().setDescription("There is nothing playing.").setColor("ORANGE")
      );
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.react("🛑");
  },
};
