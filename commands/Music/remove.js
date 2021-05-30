require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");

module.exports = {
  name: "remove",
  aliases: ["rm", "r"],
  description: "Remove song from the queue.",
  usage: "<number song>",
  group: "Music",
  memberName: "Remove",
  args: true,
  guildOnly: true,
  cooldown: 3,
  callback: async (message, args) => {
    const { client, guild, member } = message;
    const serverQueue = client.queue.get(guild.id);
    const voiceChannel = member.voice.channel;
    let prefix = prefix_db.has(guild.id)
      ? await prefix_db.get(`${guild.id}.prefix`)
      : client.config.prefix;

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

    if (!serverQueue) return message.inlineReply("There is nothing playing.");

    const position = parseInt(args[0]) - 1;
    if (isNaN(position)) {
      return message.inlineReply(
        new Embed().setDescription("That doesn't seem to be a number").setColor("RED")
      );
    }

    if (position === 0) {
      return message.inlineReply(
        new Embed()
          .setDescription(`You can't remove the current song, use \`${prefix}skip\`.`)
          .setColor("RED")
      );
    }

    if (!serverQueue.songs[position]) {
      return message.inlineReply(
        new Embed()
          .setDescription("A song with that position doesn't exist in this queue.")
          .setColor("RED")
      );
    }

    const songToRemove = serverQueue.songs.pop(position);
    serverQueue.txtChannel.send(
      new Embed()
        .setDescription(`${message.author} ❌ removed **${songToRemove.fullTitle}** from the queue.`)
        .setColor("ORANGE")
    );
  },
};
