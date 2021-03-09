const { MessageEmbed: Embed } = require("discord.js");
const i18n = require("i18n");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const timeFormat = require("../timeFormat");
const { play } = require("../../include/play");
const YoutubeAPI = require("simple-youtube-api");

const { MAX_PLAYLIST_SIZE, DEFAULT_VOLUME } = require("../../util/LeoncitoUtil");
const youtube = new YoutubeAPI(process.env.YOUTUBE_API);

module.exports = {
  name: "playlist",
  aliases: ["pl"],
  description: "Play a playlist from youtube.",
  group: "Music",
  memberName: "Playlist",
  usage: "<playlist url>",
  args: true,
  guildOnly: true,
  callback: async (message, args) => {
    const voiceChannel = message.member.voice.channel;
    const serverQueue = message.client.queue.get(message.guild.id);
    let prefix = prefix_db.has(message.guild.id)
      ? await prefix_db.get(`${message.guild.id}.prefix`)
      : default_prefix;

    if (!args.length) {
      return message.reply(i18n.__mf("playlist.usageReply", { prefix: prefix })).catch(console.error);
    }
    if (!voiceChannel) return message.reply(i18n.__("playlist.errorNotChannel")).catch(console.error);

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) return message.reply(i18n.__("playlist.missingPermissionConnect"));
    if (!permissions.has("SPEAK")) return message.reply(i18n.__("playlist.missingPermissionSpeak"));

    if (serverQueue && voiceChannel !== message.guild.me.voice.channel) {
      return message
        .reply(i18n.__mf("play.errorNotInSameChannel", { user: message.client.user }))
        .catch(console.error);
    }

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);

    const queueConstructor = {
      txtChannel: message.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: DEFAULT_VOLUME || 100,
      playing: true,
      loopone: false,
      loopall: false,
    };

    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        playlist = await youtube.getPlaylist(url, { part: "snippet" });
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        console.error(error);
        return message.reply(i18n.__("playlist.errorNotFoundPlaylist")).catch(console.error);
      }
    } else {
      try {
        const results = youtube.searchPlaylists(search, 1, { part: "snippet" });
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        return message.reply(error.message).catch(console.error);
      }
    }

    const newSongs = videos
      .filter((video) => video.title != "Private video" && video.title != "Deleted video")
      .map((video) => {
        return (song = {
          title: video.title,
          url: video.url,
          duration: timeFormat(video.videoDetails.lengthSeconds),
          requestBy: message.member.user,
        });
      });

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstructor.songs.push(...newSongs);

    let playlistEmbed = new Embed()
      .setTitle(`${playlist.title}`)
      .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.title}`))
      .setURL(playlist.url)
      .setColor("#F8AA2A")
      .setTimestamp();

    if (playlistEmbed.description.length >= 2048)
      playlistEmbed.description =
        playlistEmbed.description.substr(0, 1091) + i18n.__("playlist.playlistCharLimit");

    message.channel.send(
      i18n.__mf("playlist.startedPlaylist", { author: message.author }),
      playlistEmbed
    );

    if (!serverQueue) {
      message.client.queue.set(message.guild.id, queueConstructor);

      try {
        queueConstructor.connection = await voiceChannel.join();
        await queueConstructor.connection.voice.setSelfDeaf(true);
        play(queueConstructor.songs[0], message);
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await voiceChannel.leave();
        return message.channel
          .send(i18n.__("play.cantJoinChannel", { error: error }))
          .catch(console.error);
      }
    }
  },
};
