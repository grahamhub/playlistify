const Discord = require('discord.js');
const Messenger = require('./messenger');

class Client extends Discord.Client {
  constructor() {
    super();
    this.messenger = new Messenger(process.env.CHANNEL);
    this.readyState = 'not ready';
    this.on('ready', this.setState);
  }

  static shouldHandle(message) {
    return (
      message.channel === process.env.CHANNEL && message.content.startsWith('!')
    );
  }

  static buildCommand(content) {
    const contArr = content.split(' ');

    const command = contArr.shift().slice(1);
    const args = [...contArr];

    return {
      command,
      args,
    };
  }

  setState() {
    this.readyState = 'ready';
  }

  parseCommand(message) {
    if (this.shouldHandle(message)) {
      return this.buildCommand(message.content);
    }

    return null;
  }
}

module.exports = Client;
