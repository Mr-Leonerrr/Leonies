require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "skip",
  aliases: ["sk"],
  description: "Skip a song.",
  group: "Music",
  memberName: "Skip",
  guildOnly: true,
  cooldown: 5,
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
          new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")
        )
        .catch((error) => console.error(error));
    }

    if (!serverQueue) {
      return message.inlineReply(
        new Embed().setDescription("There is nothing playing.").setColor("ORANGE")
      );
    }

    message.react("⏭");
    serverQueue.connection.dispatcher.end();
  },
};
