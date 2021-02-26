const Discord = require("discord.js");
const moment = require("moment");

const DEVICES = { web: "🌐", desktop: "💻", mobile: "📱" };

module.exports = {
  name: "userinfo",
  description: "Get the info of tagged users or your own info.",
  aliases: ["info", "ui"],
  group: "Utility",
  memberName: "User Info",
  cooldown: 3,
  guildOnly: true,
  execute(client, message, args) {
    const BADGES = {
      DISCORD_EMPLOYEE: client.emojis.cache.get("811850574222983210"),
      DISCORD_PARTNER: client.emojis.cache.get("811850572109447168"),
      BUGHUNTER_LEVEL_1: client.emojis.cache.get("811850583303520326"),
      HYPESQUAD_EVENTS: client.emojis.cache.get("811850570360029206"),
      HOUSE_BRAVERY: client.emojis.cache.get("811850572848037928"),
      HOUSE_BRILLIANCE: client.emojis.cache.get("811850573426065459"),
      HOUSE_BALANCE: client.emojis.cache.get("811850570284924948"),
      EARLY_SUPPORTER: client.emojis.cache.get("811850613691645992"),
      VERIFIED_BOT: client.emojis.cache.get("811850620167782420"),
      VERIFIED_DEVELOPER: client.emojis.cache.get("811850572038012978"),
    };

    const STATUSES = {
      online: client.emojis.cache.get("811467331954802731"),
      idle: client.emojis.cache.get("811465963077500938"),
      dnd: client.emojis.cache.get("811465975135207454"),
      streaming: client.emojis.cache.get("811854003054182432"),
      offline: client.emojis.cache.get("811465951978979328"),
    };

    const member =
      message.mentions.members.last() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    const trimArray = (arr, maxLen = 10) => {
      if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(` and ${len} more roles...`);
      }
      return arr;
    };

    const upperCase = (str) => {
      return str.toUpperCase().replace(/_/g, " ").split(" ").join(" ");
    };

    const titleCase = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ");
    };

    const roles = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, -1);

    let userFlags;
    if (member.user.flags === null) userFlags = "";
    else userFlags = member.user.flags.toArray();

    let status;
    let userDevice;
    if (member.user.presence.status == "offline") {
      status = "Offline";
      userDevice = "";
    }

    if (member.user.presence.status == "online") status = "Online";
    if (member.user.presence.status == "dnd") status = "DND";
    else titleCase(member.user.presence.status);

    if (!member.user.bot) {
      userDevice = DEVICES[Object.keys(member.user.presence.clientStatus)[0]];
    } else if (member.user.bot) {
      userDevice = "";
    }

    let userInfo;
    if (!member.user.bot) {
      userInfo = "No";
    } else if (member.user.bot) {
      userInfo = "Yes";
    }

    const emb = new Discord.MessageEmbed()
      .setAuthor(
        `${member.user.tag} ${userDevice}`,
        member.user.displayAvatarURL({ dynamic: true, size: 512 })
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor(`${member.displayHexColor}` || 5814783)
      .addFields(
        {
          name: "User Badges",
          value: `${
            userFlags.length
              ? userFlags.map((flag) => BADGES[flag]).join(" ")
              : "None"
          }`,
          inline: false,
        },
        {
          name: "Joined Discord",
          value: `${moment(member.user.createdTimestamp).format("DD/MM/YYYY")}`,
          inline: true,
        },
        {
          name: "Joined Server",
          value: `${moment(member.joinedAt).format("DD/MM/YYYY")}`,
          inline: true,
        },
        {
          name: "Nickname",
          value: `${member.displayName}` || "None",
          inline: true,
        },
        {
          name: "Discriminator",
          value: `${member.user.discriminator}`,
          inline: true,
        },
        { name: "Bot", value: userInfo, inline: true },
        {
          name: "Status",
          value: `${status} ${STATUSES[member.user.presence.status]}`,
          inline: true,
        },
        {
          name: "User Colour",
          value: `${upperCase(member.displayHexColor)}`,
          inline: true,
        },
        { name: "User ID", value: `${member.user.id}`, inline: true },
        {
          name: "Highest Role",
          value: `${
            member.roles.highest.id === message.guild.id
              ? "None"
              : member.roles.highest
          }`,
          inline: true,
        },
        {
          name: "Roles",
          value: `${
            roles.length < 10
              ? roles.join(", ")
              : roles.length > 10
              ? trimArray(roles).join(", ")
              : "None"
          }`,
          inline: false,
        }
      );
    message.channel.send(emb);
  },
};
