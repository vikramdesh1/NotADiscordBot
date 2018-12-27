const Discord = require('discord.js');
const { dccrew, meetupkey } = require('../config.json');
const request = require('request-promise-native');

const meetupRegex = /https:\/\/www\.meetup\.com\/(\w+)\/events\/(\w+)\/?/;

function getNMessagesFromChannel(client, numberOfMessages, channel, lastMessageId) {
    const options = {
        limit: numberOfMessages
    };
    if (lastMessageId != undefined) {
        options.before = lastMessageId
    }
    return new Promise((resolve, reject) => {
        client.guilds.get(dccrew.id).channels.get(channel).fetchMessages(options).then(messages => {
            resolve(messages.array());
        }).catch(error => reject(error));
    });
}

function parseMeetup(message) {
    let matchedArray = meetupRegex.exec(message.content);
    let uri = `https://api.meetup.com/${matchedArray[1]}/events/${matchedArray[2]}?key=${meetupkey}`;
    const options = {
        method: 'GET',
        uri: uri,
    };
    request(options).then(resp => {
        let meetup = JSON.parse(resp);
        let embed = new Discord.RichEmbed();
        embed.setTitle(meetup.name);
        embed.setDescription(meetup.description.replace(/(<\/?\w+\/?>)+/g, ''));
        embed.setURL(meetup.link);
        embed.setColor('0x00FF00');
        let date = meetup.local_date.split('-');
        embed.addField('Date', new Date(date[0], date[1] - 1, date[2]).toDateString());
        embed.addField('Time', meetup.local_time);
        embed.addField('Location', meetup.venue.name + ' @ ' + meetup.venue.address_1 + ', ' + meetup.venue.city + ', ' + meetup.venue.state);
        message.channel.send(embed);
    });
}

exports.getNMessagesFromChannel = getNMessagesFromChannel;
exports.parseMeetup = parseMeetup;