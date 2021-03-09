module.exports = {
  name: "ping",
  description: "Know the response time of the bot.",
  group: "Utility",
  memberName: "Ping",
  cooldown: 5,
  callback: (message) => {
    message.channel.send(
      `🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(
        message.client.ws.ping
      )}ms`
    );
  },
};
