const {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  StreamType,
} = require("@discordjs/voice");
const { MessageEmbed: Embed, TextChannel, ThreadChannel } = require("discord.js");
const ytdl = require("discord-ytdl-core");
const { Util } = require("../Utils/util");

class Player {
  constructor() {
    /** @type {VoiceConnection} */
    this.connection = null;

    /** @type {Number} */
    this.connectionTimeout = 20000;

    /** @type {AudioPlayer} */
    this.player = createAudioPlayer();

    /** @type {Array} */
    this.tracks = [];

    /** @type {Number} */
    this.volume = 100;

    /** @type {Boolean} */
    this.loopOne = false;

    /** @type {Boolean} */
    this.loopQueue = false;

    /** @type {Boolean} */
    this.readyLock = false;

    /** @type {TextChannel | ThreadChannel} */
    this.txtChannel;
  }

  /**
   * @param {VoiceConnection} connection
   */
  voiceConnection(connection) {
    this.connection = connection;
    this.connection.on("stateChange", async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.connection,
              VoiceConnectionStatus.Connecting,
              this.connectionTimeout
            );
          } catch (error) {
            console.log(error);
            this.connection.destroy();
          }
        } else if (this.connection.rejoinAttempts < 5) {
          await Util.wait((this.connection.rejoinAttempts + 1) * 5000);
          this.connection.rejoin();
        } else {
          this.connection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        if (this.nowPlaying !== null) {
          this.txtChannel.client.queue
            .get(this.txtChannel.guildId)
            .queueHistory.unshift(this.nowPlaying);
        }
        this.stop();
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
        try {
          await entersState(this.connection, VoiceConnectionStatus.Ready, this.connectionTimeout);
        } catch {
          if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.connection.destroy();
          }
        }
      }
    });

    this.player.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        if (this.loopOne) {
          this.process(this.tracks.unshift(this.nowPlaying));
        } else if (this.loopQueue) {
          this.process(this.tracks.push(this.nowPlaying));
        } else {
          if (this.nowPlaying !== null) {
            this.txtChannel.client.queue
              .get(this.txtChannel.guildId)
              .queueHistory.unshift(this.nowPlaying);
          }
          //Finished playing audio
          if (this.tracks.length) {
            this.process(this.tracks);
          } else {
            //leave channel close connection
            if (this.connection._state.status !== "destroyed") {
              this.connection.destroy();
              this.txtChannel.client.playerManager.delete(this.txtChannel.guildId);
            }
          }
        }
      } else if (newState.status === AudioPlayerStatus.Playing) {
        const queueHistory = this.txtChannel.client.queue.get(
          this.txtChannel.guildId
        ).queueHistory;

        const playingEmbed = new Embed()
          .setTitle("🎶 Started playing")
          .setDescription(`[${this.nowPlaying.title}](${this.nowPlaying.url})`)
          .setThumbnail(this.nowPlaying.thumbnail)
          .addField("Request by", `[${this.nowPlaying.requestedBy}]`, true)
          .addField("Duration", this.nowPlaying.duration, true)
          .setColor("RANDOM")
          .setTimestamp();

        if (queueHistory.length) {
          playingEmbed.addField("Previous Song", queueHistory[0].title);
        }
        this.txtChannel.send({ embeds: [playingEmbed] });
      }
    });

    this.player.on("error", (error) => console.error(error));

    this.connection.subscribe(this.player);
  }

  stop() {
    this.tracks.length = 0;
    this.nowPlaying = null;
    this.skipTimer = false;
    this.isPreviousTrack = false;
    this.loopOne = false;
    this.loopQueue = false;
    this.player.stop(true);
  }

  async process(tracks) {
    if (this.player.state.status !== AudioPlayerStatus.Idle || this.tracks.length === 0) return;

    const track = this.tracks.shift();
    this.nowPlaying = track;
    if (this.readyLock) this.readyLock = false;
    try {
      //const resource = await this.createAudioResource(song.url);
      const stream = await ytdl(track.url, {
        filter: "audioonly",
        quality: "highestaudio",
        opusEncoded: true,
      });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      });
      this.player.play(resource);
    } catch (err) {
      console.error(err);
      return this.process(tracks);
    }
  }
}

module.exports = Player;
