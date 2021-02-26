module.exports = {
  name: "pause",
  aliases: ["ps", "pause-song", "hold"],
  description: "Pause the current playing song.",
  group: "music",
  memberName: "pause",
  cooldown: 3,
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

    if (serverQueue.connection.dispatcher.paused)
      return message.channel.send("The song is already paused");

    if (message.member.voice.channel.id !== message.guild.me.voice.channel.id)
      return message.reply(
        `⛔ You must be in the same voice channel as the bot's in order to use that!`
      );

    message.react("⏸");
    serverQueue.connection.dispatcher.pause();
  },
};
