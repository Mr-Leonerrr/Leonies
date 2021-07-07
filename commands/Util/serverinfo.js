const { Message, MessageEmbed: Embed } = require("discord.js");
const moment = require("moment");

const region = {
  "brazil": "Brazil :flag_br:",
  "europe": "Europe :flag_eu:",
  "india": "India :flag_in:",
  "japan": "Japan :flag_jp:",
  "singapore": "Singapore :flag_sg:",
  "us-central": "US-Central :flag_us:",
  "us-east": "US-East :flag_us:",
  "us-south": "US-South :flag_us:",
  "us-west": "US-West :flag_us:",
  "sydney": "Sydney :flag_au:",
  "hongkong": "Hong Kong :flag_hk:",
  "russia": "Russia :flag_ru:",
  "south_africa": "South Africa :flag_za:",
};

module.exports = {
  name: "server",
  aliases: ["svr", "si", "serverinfo"],
  description: "Displays information about the server.",
  group: "Utility",
  memberName: "Server info",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   */
  callback: (message) => {
    const { guild, channel } = message;
    const titleCase = (str) => {
      return str
        .toLowerCase()
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join();
    };

    const members = guild.members.cache.filter((member) => !member.user.bot).size;
    const onlineMembers = guild.members.cache
      .filter((member) => !member.user.bot)
      .filter((member) => member.presence.status !== "offline").size;
    const bots = guild.members.cache.filter((member) => member.user.bot).size;
    const onlineBots = guild.members.cache
      .filter((member) => member.user.bot)
      .filter((member) => member.presence.status !== "offline").size;
    const textChannels = guild.channels.cache.filter((chn) => chn.type === "text").size;
    const voiceChannels = guild.channels.cache.filter((chn) => chn.type === "voice").size;
    const categories = guild.channels.cache.filter((chn) => chn.type == "category").size;
    const roleCount = guild.roles.cache.size - 1;

    let icon = guild.iconURL({ dynamic: true, size: 512 });
    if (!icon) {
      icon = "https://i.imgur.com/AWGDmiu.png";
    }

    const embed = new Embed()
      .setAuthor(`${guild.name}`, icon)
      .setDescription(
        `${guild.name} was created on ${moment(guild.createdAt).format("MMMM DD/YYYY")}`
      )
      .setThumbnail(icon)
      .addFields(
        {
          name: "Region",
          value: `${region[guild.region]}`,
          inline: true,
        },
        {
          name: "Total Users/Bots",
          value: `${guild.members.cache.size} Users/Bots`,
          inline: true,
        },
        {
          name: "Users",
          value: `${members} Users (${onlineMembers} Online)`,
          inline: true,
        },
        {
          name: "Bots",
          value: `${bots} Bots (${onlineBots} Online)`,
          inline: true,
        },
        {
          name: "Boosts",
          value: `${guild.premiumSubscriptionCount} Boosts`,
          inline: true,
        },
        {
          name: "Text Channels",
          value: `${textChannels}`,
          inline: true,
        },
        {
          name: "Voice Channels",
          value: `${voiceChannels}`,
          inline: true,
        },
        {
          name: "Categories",
          value: `${categories}`,
          inline: true,
        },
        {
          name: "Verification Level",
          value: `${titleCase(guild.verificationLevel)}`,
          inline: true,
        },
        {
          name: "AFK Timeout",
          value: guild.afkChannel
            ? `${moment.duration(guild.afkTimeout * 1000).asMinutes()} minute(s)`
            : "None",
          inline: true,
        },
        {
          name: "AFK Channel",
          value: guild.afkChannel ? `${guild.afkChannel.name}` : "None",
          inline: true,
        },
        {
          name: "Explicit Content Filter",
          value: `${titleCase(guild.explicitContentFilter)}`,
          inline: true,
        },
        {
          name: "Roles",
          value: `${roleCount}`,
          inline: true,
        },
        {
          name: "Server Owner",
          value: `[${guild.owner.user.tag}](https://discord.com/users/${guild.owner.user.id} "https://discord.com/users/${guild.owner.user.id}")`,
          inline: true,
        },
        {
          name: "Server ID",
          value: `${guild.id}`,
          inline: true,
        }
      );

    channel.send(embed);
  },
};
