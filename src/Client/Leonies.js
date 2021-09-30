require("dotenv").config();
const { Client, Collection } = require("discord.js");

class Leonies extends Client {
  /**
   * Leonies client constructor
   * @param {import("discord.js").ClientOptions} options The client options
   * @example new Leonies({ intents: 5839 })
   */
  constructor(options) {
    super(options);
    this.config = require("../../config.json");
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();
    this.queue = new Collection();
    this.invite = this.config.invite;
  }

  async init() {
    this.login(process.env.TOKEN).then(() => this.isReady());

    await require("../Functions/loadCommands")(this);
    await require("../Functions/loadEvents").run();
  }
}

module.exports.Leonies = Leonies;
