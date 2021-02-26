module.exports = {
  name: "volume",
  description: "Volume command.",
  aliases: ["vol", "v"],
  group: "music",
  memberName: "volume",
  usage: "[volume]",
  cooldown: 5,
  guildOnly: true,
  execute(client, message, args, queue) {
    if (!message.member.voice)
      return message.channel.send(
        "I'm sorry but you need to be in a voice channel to play music!"
      );
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!args[0])
      return message.channel.send(
        `The current volume is: **${serverQueue.volume}%**`
      );
    serverQueue.volume = args[0]; // eslint-disable-line
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 80);
    return message.channel.send(`I set the volume to: **${args[0]}%**`);
  },
};
