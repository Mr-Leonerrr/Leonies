module.exports = {
  name: "skip",
  description: "Skip a song.",
  aliases: ["sk"],
  group: "music",
  cooldown: 5,
  guildOnly: true,
  execute(client, message, args, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) {
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You are not in the voice channel!",
          color: 16515072,
        },
      });
    }

    if (!serverQueue) {
      return message.channel.send("There is no song that I could skip!");
    }
    message.react("⏭");
    serverQueue.connection.dispatcher.end();
  },
};
