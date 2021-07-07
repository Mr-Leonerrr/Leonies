const { Message, MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "Show current playlist.",
  group: "Music",
  memberName: "Queue",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   */
  callback: async (message) => {
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

    if (serverQueue.songs.length === 1) {
      return client.commands.get("nowplaying").callback(message);
    }

    let currentPage = 0;
    const embeds = generateQueueEmbed(serverQueue.songs);

    const queueEmbed = await channel.send(
      `**Current Page - ${currentPage + 1}/${embeds.length}**`,
      embeds[currentPage]
    );

    if (embeds.length > 1) {
      try {
        await queueEmbed.react("⬅️");
        await queueEmbed.react("⏹");
        await queueEmbed.react("➡️");
      } catch (error) {
        console.error(error);
        channel.send(error.message).catch((error) => console.error(error));
      }
    }

    const filter = (reaction, user) =>
      ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(
              `Current Page - ${currentPage + 1}/${embeds.length}`,
              embeds[currentPage]
            );
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(
              `Current Page - ${currentPage + 1}/${embeds.length}`,
              embed[currentPage]
            );
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return channel.send(error.message).catch((error) => console.error(error));
      }
    });
  },
};

function generateQueueEmbed(serverQueue) {
  const embeds = [];
  let songs = 11;

  for (let i = 1; i < serverQueue.length; i += 10) {
    const current = serverQueue.slice(i++, songs);
    let j = i - 1;
    songs += 10;

    const info = current
      .map((track) => `${++j}. [${track.fullTitle}](${track.url}) | \`${track.duration}\``)
      .join("\n");

    let embed = new Embed()
      .setTitle("Songs Queue")
      .setThumbnail(serverQueue[0].thumbnail)
      .setDescription(
        `**Current Song \n[${serverQueue[0].fullTitle}](${serverQueue[0].url})**\n\n${info}`
      )
      .setColor("RANDOM")
      .addField("Entries", `${serverQueue.length} Songs`, true);
    embeds.push(embed);
  }
  return embeds;
}
