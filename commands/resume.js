module.exports = {
  name: "resume",
  aliases: ["r", "resume-song", "continue"],
  description: "Resume the current paused song.",
  group: "music",
  memberName: "resume",
  cooldown: 5,
  guildOnly: true,
  execute(client, message, args, queue) {
    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You're not in the voice channel!",
          color: 16515072,
        },
      });

    if (voiceChannel !== message.guild.me.voice.channel) {
      return message.reply(
        "⛔ You must be in the same voice channel as the bot's in order to use that!"
      );
    }

    if (!serverQueue)
      return message.channel.send("There is no music currently playing!");

    if (serverQueue.connection.dispatcher.resumed)
      return message.channel.send("The song is already playing!");
    message.react("▶");
    serverQueue.connection.dispatcher.resume();
  },
};
