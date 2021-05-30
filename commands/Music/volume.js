require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  description: "Change volume of currently playing music.",
  group: "Music",
  memberName: "Volume",
  usage: "[volume]",
  guildOnly: true,
  cooldown: 3,
  callback: (message, args) => {
    const { client, guild, channel, member } = message;
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

    if (!args.length)
      return message.inlineReply(
        new Embed().setDescription(`The current volume is: **${serverQueue.volume}%**`).setColor("BLUE")
      );

    const amount = parseInt(args[0]);
    if (isNaN(amount)) {
      return message.inlineReply(
        new Embed().setDescription("That doesn't seem to be a number.").setColor("RED")
      );
    } else if (amount < 1 || amount > 100) {
      return message.inlineReply(
        new Embed().setDescription("Please enter a number between 1 and 100").setColor("ORANGE")
      );
    }

    serverQueue.volume = amount; // eslint-disable-line
    serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    return channel
      .send(
        new Embed().setDescription(`I set the volume to: **${serverQueue.volume}%**`).setColor("GREEN")
      )
      .catch(console.error);
  },
};
