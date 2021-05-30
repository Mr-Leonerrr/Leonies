module.exports = async (client) => {
  const activities = [
    `${client.config.prefix}help`,
    `Ping for prefix.`,
    `${client.guilds.cache.size} Servers`,
  ];

  setInterval(() => {
    const index = Math.floor(Math.random() * activities.length);
    client.user.setActivity(activities[index], { type: "LISTENING" });
  }, 5000);

  console.log(`\n${client.user.username} is ready!`);
};
