const client = require("../../index");
const { Message, MessageEmbed: Embed } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const { play } = require("../../Include/play");
const { playlist } = require("../../Include/playlist");
const ytdl = require("discord-ytdl-core");
const { Client } = require("youtubei");
const youtube = new Client();
const { timeFormat, createQuery } = require("../../Functions/musicFunctions");

const { error } = require("../../Include/Messages/status");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Plays audio from Youtube",
  usage: "<name song | url | playlist url>",
  group: "Music",
  memberName: "Play",
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { guildId, channel, member } = message;
    const queue = client.queue.get(guildId);
    const voiceChannel = member.voice;

    const permissions = voiceChannel.channel.permissionsFor(client.user);
    if (!permissions.has("CONNECT")) {
      return message.reply({
        embeds: [error("I couldn't connect to the voice channel, missing permissions.")],
      });
    }

    if (!permissions.has("SPEAK")) {
      return message.reply({
        embeds: [
          error("I can't speak in this voice channel, make sure I've the proper permissions!"),
        ],
      });
    }

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#&?]*).*/gi;
    const url = args[0];
    const urlValid = videoPattern.test(url);

    //Playlist
    if (!videoPattern.test(url) && playlistPattern.test(url)) {
      return playlist(message, args);
    }

    const queueConstructor = {
      txtChannel: channel,
      voiceChannel: member.voice,
      connection: null,
      tracks: [],
      volume: 100,
      playing: true,
      loopone: false,
      loopall: false,
    };

    let trackInfo = null;
    let getInfo = null;
    let thumbnail;
    let track;

    try {
      if (urlValid) {
        trackInfo = await ytdl.getInfo(url);
        getInfo = createQuery(trackInfo.videoDetails.title);
      } else {
        const video = await youtube.findOne(search, { type: "video" });
        if (!video) {
          return message.reply({
            embeds: [new Embed().setDescription("No results found.").setColor("ORANGE")],
          });
        }
        const videoId = video.id;
        trackInfo = await ytdl.getInfo(`https://youtu.be/${videoId}`);
        getInfo = createQuery(trackInfo.videoDetails.title);
      }

      if (trackInfo.videoDetails.thumbnails[4] === undefined)
        thumbnail = trackInfo.videoDetails.thumbnails[3].url;
      else thumbnail = trackInfo.videoDetails.thumbnails[4].url;
      track = {
        title: getInfo[1],
        artist: getInfo[0],
        fullTitle: trackInfo.videoDetails.title,
        url: trackInfo.videoDetails.video_url,
        duration: timeFormat(trackInfo.videoDetails.lengthSeconds),
        thumbnail: thumbnail,
        requestedBy: member.user,
      };
    } catch (error) {
      console.error(error);
      await message.reply(error.message);
    }

    if (queue) {
      queue.tracks.push(track);
      return queue.txtChannel.send({
        embeds: [
          new Embed()
            .setDescription(`✅ **Queued** [${track.fullTitle}](${track.url})`)
            .addField("Requested by", `[${track.requestedBy}]`, true)
            .setColor("GREEN")
            .setFooter(`Queue position: ${queue.tracks.lastIndexOf(track) + 1}`),
        ],
      });
    }

    queueConstructor.tracks.push(track);
    client.queue.set(guildId, queueConstructor);

    try {
      queueConstructor.connection = joinVoiceChannel({
        channelId: voiceChannel.channelId,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true,
      });
      await play(queueConstructor.tracks[0], message);
    } catch (error) {
      console.error(error);
      client.queue.delete(guildId);
      channel.send({
        embeds: [
          new Embed()
            .setDescription(`I Couldn't join to the voice channel: ${error}`)
            .setColor("RED"),
        ],
      });
    }
  },
};
