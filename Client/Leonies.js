require("dotenv").config();

const { Client, Collection } = require("discord.js");

class Leonies extends Client {
  constructor(options) {
    super(options);
    this.config = require("../config.json");
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();
    this.cooldowns = new Collection();
    this.queue = new Map();
    this.invite = "bot-invitation-url";
  }

  async init() {
    this.login(process.env.TOKEN);
    require("../Functions/Commands").run(this);
    require("../Functions/Events").run(this);
  }
}

module.exports = Leonies;
