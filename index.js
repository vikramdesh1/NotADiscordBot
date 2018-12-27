const Discord = require('discord.js');
const {
    prefix,
    token } = require('./config.json');
const client = new Discord.Client();
const schedule = require('node-schedule');
const commands = require('./js/commands.js');

//Discord.js event handlers
client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('Overwatch');

    //Scheduling purge event
    var rule = new schedule.RecurrenceRule();
    rule.date = 1;
    rule.hour = 12;
    rule.minute = 0;
    rule.second = 0;
    var j = schedule.scheduleJob(rule, function () {
        commands.purgeInactiveMembers(client);
    });
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command == 'ping') {
        message.reply('pong');
    }
});

client.login(token);
