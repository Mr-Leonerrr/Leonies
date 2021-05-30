require("../Features/ExtendMessage");
const { MessageEmbed: Embed } = require("discord.js");
const { createQuery } = require("../Features/musicFunctions");
const { play } = require("./play");
const ytpl = require("ytpl");

module.exports = {
  async playlist(message, args) {
    const { client, guild, channel, member } = message;
    const voiceChannel = member.voice.channel;
    const serverQueue = client.queue.get(guild.id);

    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
      );
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message
        .inlineReply(`You must be in the same channel as ${message.client.user}`)
        .catch((error) => console.error(error));
    }

    if (member.voice.deaf) {
      message.react("🔇");
      return message.inlineReply(
        new Embed().setDescription("You can't run this command while deafened!").setColor("RED")
      );
    }

    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has("CONNECT"))
      return channel.reply(":x: I couldn't connect to the voice channel, missing permissions.");
    if (!permissions.has("SPEAK"))
      return channel.reply(
        ":x: I can't speak in this voice channel, make sure I've the proper permissions!"
      );

    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(url);

    const queueConstructor = {
      txtChannel: channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      loopone: false,
      loopall: false,
    };

    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        playlist = await ytpl(url, { limit: 50 });
        videos = playlist.items;
      } catch (error) {
        console.error(error);
        return message.reply("Playlist not found :(").catch((error) => console.error(error));
      }
    } else {
      return channel.inlineReply(new Embed().setDescription("Invalid Playlist URL").setColor("ORANGE"));
    }

    const newSongs = videos
      .filter((video) => video.title != "Private video" && video.title != "Deleted video")
      .map((video) => {
        const getInfo = createQuery(video.title);
        return (song = {
          title: getInfo[0],
          artist: getInfo[0],
          fullTitle: video.title,
          url: video.url,
          duration: video.duration,
          thumbnail: video.bestThumbnail.url,
          requestBy: member.user,
        });
      });

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstructor.songs.push(...newSongs);

    let playlistEmbed = new Embed()
      .setTitle(`${playlist.title}`)
      .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.fullTitle}`))
      .setURL(playlist.url)
      .setColor("#F8AA2A")
      .setTimestamp();

    if (playlistEmbed.description.length >= 2048)
      playlistEmbed.description =
        playlistEmbed.description.substr(0, 1091) + "\nPlaylist larger than character limit...";

    channel.send(`${message.author} Started a playlist`, playlistEmbed);

    if (!serverQueue) {
      client.queue.set(guild.id, queueConstructor);

      try {
        queueConstructor.connection = await voiceChannel.join();
        await queueConstructor.connection.voice.setSelfDeaf(true);
        play(queueConstructor.songs[0], message);
      } catch (error) {
        console.error(error);
        client.queue.delete(guild.id);
        await voiceChannel.leave();
        return channel
          .send(
            new Embed().setDescription(`I Couldn't join to the voice channel: ${error}`).setColor("RED")
          )
          .catch((error) => console.error(error));
      }
    }
  },
};
