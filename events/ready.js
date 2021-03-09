const { default_prefix } = require("../config.json");

module.exports = async (client) => {
  client.invite = await client
    .generateInvite({
      permissions: [
        "CREATE_INSTANT_INVITE",
        "SEND_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "ADD_REACTIONS",
        "USE_EXTERNAL_EMOJIS",
        "CONNECT",
        "SPEAK",
      ],
    })
    .then((link) => {
      return link;
    })
    .catch(console.error);

  client.ownerInfo = await client
    .fetchApplication()
    .then((application) => {
      return `Developed by ${application.owner.tag}`;
    })
    .catch(console.error);

  const activities = [
    `${default_prefix}help`,
    `${client.guilds.cache.size} Servers`,
  ];

  setInterval(() => {
    const index = Math.floor(Math.random() * activities.length);
    client.user.setActivity(activities[index], { type: "LISTENING" });
  }, 10000);

  console.log(`\n${client.user.username} is ready!`);
};
