const Discord = require("discord.js");
const moment = require("moment");

const region = {
  brazil: "Brazil :flag_br:",
  europe: "Europe :flag_eu:",
  india: "India :flag_in:",
  japan: "Japan :flag_jp:",
  singapore: "Singapore :flag_sg",
  "us-central": "US-Central :flag_us:",
  "us-east": "US-East :flag_us:",
  "us-south": "US-South :flag_us",
  "us-west": "US-West :flag_us:",
  sydney: "Sydney :flag_au:",
  hongkong: "Hong Kong :flag_hk:",
  russia: "Russia :flag_ru:",
  south_africa: "South Africa :flag_za:",
};

module.exports = {
  name: "server",
  description: "Displays information about the server.",
  aliases: ["svr", "si", "serverinfo"],
  group: "Utility",
  memberName: "Server info",
  cooldown: 3,
  guildOnly: true,
  execute(client, message) {
    const titleCase = (str) => {
      return str
        .toLowerCase()
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join();
    };

    let members = message.guild.members.cache.filter(
      (member) => !member.user.bot
    ).size;
    let onlineMembers = message.guild.members.cache
      .filter((member) => !member.user.bot)
      .filter((member) => member.presence.status !== "offline").size;
    let bots = message.guild.members.cache.filter((member) => member.user.bot)
      .size;
    let onlineBots = message.guild.members.cache
      .filter((member) => member.user.bot)
      .filter((member) => member.presence.status !== "offline").size;
    let textChannels = message.guild.channels.cache.filter(
      (chn) => chn.type === "text"
    ).size;
    let voiceChannels = message.guild.channels.cache.filter(
      (chn) => chn.type === "voice"
    ).size;
    let categories = message.guild.channels.cache.filter(
      (chn) => chn.type == "category"
    ).size;
    let roleCount = message.guild.roles.cache.size - 1;

    let icon = message.guild.iconURL({ dynamic: true, size: 512 });
    if (!icon) {
      icon = "https://i.imgur.com/AWGDmiu.png";
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(`${message.guild.name}`, icon)
      .setDescription(
        `${message.guild.name} was created on ${moment(
          message.guild.createdAt
        ).format("MMMM DD/YYYY")}`
      )
      .setThumbnail(icon)
      .addFields(
        {
          name: "Region",
          value: `${region[message.guild.region]}`,
          inline: true,
        },
        {
          name: "Total Users/Bots",
          value: `${message.guild.members.cache.size} Users/Bots`,
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
          value: `${message.guild.premiumSubscriptionCount} Boosts`,
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
          value: `${titleCase(message.guild.verificationLevel)}`,
          inline: true,
        },
        {
          name: "AFK Timeout",
          value: message.guild.afkChannel
            ? `${moment
                .duration(message.guild.afkTimeout * 1000)
                .asMinutes()} minute(s)`
            : "None",
          inline: true,
        },
        {
          name: "AFK Channel",
          value: message.guild.afkChannel
            ? `${message.guild.afkChannel.name}`
            : "None",
          inline: true,
        },
        {
          name: "Explicit Content Filter",
          value: `${titleCase(message.guild.explicitContentFilter)}`,
          inline: true,
        },
        {
          name: "Roles",
          value: `${roleCount}`,
          inline: true,
        },
        {
          name: "Server Owner",
          value: `[${message.guild.owner.user.tag}](https://dicord.com/users/${message.guild.owner.user.id} "https://dicord.com/users/${message.guild.owner.user.id}")`,
          inline: true,
        },
        {
          name: "Server ID",
          value: `${message.guild.id}`,
          inline: true,
        }
      );

    message.channel.send(embed);
  },
};
