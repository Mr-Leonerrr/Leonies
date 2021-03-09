const fs = require("fs");
const { join } = require("path");
const eventDir = join(__dirname, "..", "events");

module.exports.run = (client) => {
  const eventFiles = fs.readdirSync(eventDir);

  for (const eventFile of eventFiles) {
    const event = require(`${eventDir}/${eventFile}`);
    const eventName = eventFile.split(".").shift();
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`${eventDir}/${eventFile}`)];
  }
  client.events = eventFiles.length;
  console.log(`Loaded ${eventFiles.length} events!`);
};
