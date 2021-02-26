module.exports = {
  name: "stop",
  description: "Stop the current queue.",
  aliases: ["s", "sp"],
  group: "music",
  memberName: "stop",
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
    if (!message.guild.me.voice.channel) {
      return message.reply("I'm not on a voice channel!");
    }
    if (message.member.voice.channel != message.guild.me.voice.channel)
      return message.reply(
        `⛔ You must be in the same voice channel as the bot's in order to use that!`
      );
    if (!serverQueue) return message.channel.send("There is no music playing!");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.react("🛑");
  },
};
