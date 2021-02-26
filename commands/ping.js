module.exports = {
  name: "ping",
  description: "Know the response time of the bot.",
  cooldown: 5,
  execute(client, message) {
    message.channel.send(
      `🏓Latency is ${
        Date.now() - message.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`
    );
  },
};
