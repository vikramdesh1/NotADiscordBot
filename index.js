const Discord = require('discord.js');
const {
    prefix,
    token, sentrydsn } = require('./config.json');
const client = new Discord.Client();
const schedule = require('node-schedule');
const commands = require('./js/commands.js');
const utilities = require('./js/utilities.js');
const Sentry = require('@sentry/node');
Sentry.init({ dsn: sentrydsn });

const meetupRegex = /https:\/\/www\.meetup\.com\/([\w-]+)\/events\/(\w+)\/?/;

//Discord.js event handlers
client.once('ready', () => {
    console.log('Bob ready for action!');
    client.user.setActivity('Overwatch');

    //Scheduling purge event
    var rule = new schedule.RecurrenceRule();
    rule.date = 1;
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    var j = schedule.scheduleJob(rule, function () {
        commands.purgeInactiveMembers(client);
    });
});

client.on('message', message => {
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command == 'ping') {
        message.reply('pong');
    } else if (meetupRegex.test(message.content)) {
        utilities.parseMeetup(message);
    }
});

client.login(token);
