const { Message, MessageEmbed: Embed } = require("discord.js");
const { Client } = require("youtubei");
const youtube = new Client();
const he = require("he");

module.exports = {
  name: "search",
  aliases: ["sh"],
  description: "Search and select videos to play.",
  usage: "<song to search>",
  group: "Music",
  memberName: "Search",
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { client, guild, channel, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    //Check if user in in some voice channel
    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
      );
    }

    if (channel.activeCollector) {
      return message.inlineReply(
        new Embed()
          .setDescription("A message collector is already active in this channel.")
          .setColor("ORANGE")
      );
    }

    //Check if user is in the same voice channel
    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message
        .inlineReply(
          new Embed()
            .setDescription(`You must be in the same channel as ${client.user}`)
            .setColor("RED")
        )
        .catch((error) => console.error(error));
    }

    const search = args.join(" ");

    let resultsEmbed = new Embed()
      .setTitle("Reply with the song number you want to play")
      .setDescription(`Results for: ${search}`)
      .setColor("PURPLE");

    let resultsMessage;

    try {
      const results = await youtube.search(search, {
        type: "video",
        maxResults: 10,
      });
      const currentPage = results;
      currentPage.map((video, index) => {
        resultsEmbed.addField(
          `https://youtu.be/${video.id}`,
          `${index + 1}. ${he.decode(video.title)}`
        );
      });

      resultsMessage = await channel.send(resultsEmbed);

      channel.activeCollector = true;
      const res = await channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
      const reply = res.first().content;

      if (reply.includes(",")) {
        const songs = reply.split(",").map((str) => str.trim());

        for (const song of songs) {
          await client.commands
            .get("play")
            .callback(message, [resultsEmbed.fields[parseInt(song) - 1].name]);
        }
      } else {
        const choice = resultsEmbed.fields[parseInt(res.first()) - 1].name;
        client.commands.get("play").callback(message, [choice]);
      }

      channel.activeCollector = false;
      resultsMessage.delete().catch((error) => console.error(error));
      res
        .first()
        .delete()
        .catch((error) => console.error(error));
    } catch (error) {
      console.error(error);
      channel.activeCollector = false;
      resultsMessage.delete().catch((error) => console.error(error));
      message.reply({
        embeds: [
          new Embed()
            .setDescription("No answer after 30 seconds, operation canceled.")
            .setColor("ORANGE"),
        ],
      });
    }
  },
};

function filter(message) {
  const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
  return pattern.test(message.content);
}
