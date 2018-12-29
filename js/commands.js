const Discord = require('discord.js');
const utilities = require('../js/utilities.js');
const { dccrew } = require('../config.json');

async function purgeInactiveMembers(client) {
    const allMessages = [];
    const scores = [];
    let today = new Date();
    let oneMonthAgo;
    let channels = client.guilds.get(dccrew.id).channels.array();
    if (today.getMonth() == 0) {
        oneMonthAgo = new Date(today.getYear() - 1, 11, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    } else {
        oneMonthAgo = new Date(today.getYear(), today.getMonth() - 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    }
    for (let i = 0; i < channels.length; i++) {
        if (channels[i].type == 'text') {
            let lastMessageId;
            let messages;
            let breakFlag = false;
            let messageDate;
            do {
                messages = await utilities.getNMessagesFromChannel(client, 100, channels[i].id, lastMessageId);
                for (let i = 0; i < messages.length; i++) {
                    messageDate = new Date(messages[i].createdAt.getYear(), messages[i].createdAt.getMonth(), messages[i].createdAt.getDate(), messages[i].createdAt.getHours(), messages[i].createdAt.getMinutes(), messages[i].createdAt.getSeconds());
                    if (messageDate < oneMonthAgo) {
                        breakFlag = true;
                        break;
                    }
                    allMessages.push(messages[i]);
                }
                lastMessageId = allMessages[allMessages.length - 1].id;
                if (breakFlag == true) {
                    break;
                }
            } while (messages.length > 0);
        }
    }
    let members = client.guilds.get(dccrew.id).members.array();
    members.forEach(member => {
        if (!member.user.bot) {
            let score = 0;
            allMessages.forEach(message => {
                if (message.author.id == member.id) {
                    score++;
                }
            });
            if (member.nickname == null) {
                scores.push({ id: member.id, name: member.user.username, score: score });
            } else {
                scores.push({ id: member.id, name: member.nickname, score: score });
            }
        }
    });
    scores.sort(function compare(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    client.guilds.get(dccrew.id).channels.get(dccrew.general).send('Purge commencing, stand by...');
    const embed = new Discord.RichEmbed();
    embed.setTitle('The Purge');
    embed.setDescription(`DC Crew\'s monthly purge - ${new Date().toDateString()}`);
    embed.setColor('0xFF0000');
    let scoresMessage = '';
    let survivorsMessage = '';
    let kickedMessage = '';
    scoresMessage += 'The following are message counts for the last month :calendar_spiral: \n';
    scores.forEach(score => {
        scoresMessage += `${score.name} : ${score.score}\n`;
        if (score.score == 0) {
            kickedMessage += `${score.name}, `;
        } else {
            survivorsMessage += `${score.name}, `;
        }
    })
    embed.addField('Scores', scoresMessage);
    embed.addField('Survivors', survivorsMessage.slice(0, -2));
    if (kickedMessage != '') {
        embed.addField('Kicked', kickedMessage.slice(0, -2));
    } else {
        embed.addField('Kicked', 'Everybody survived!');
    }
    embed.addField(':skull_crossbones:', 'Until next time!');
    client.guilds.get(dccrew.id).channels.get(dccrew.general).send(embed).then(message => {
        client.guilds.get(dccrew.id).channels.get(dccrew.general).send('Happy New Year!');
    });
    //The Kick
    scores.forEach(s => {
        if (s.score == 0) {
            client.guilds.get(dccrew.id).members.get(s.id).kick('Inactive for 1 month').then(() => {
                console.log(`Kicked ${s.name} for inactivity`);
            }).catch(error => console.error(error));
        }
    });
    console.log(scores);
}

exports.purgeInactiveMembers = purgeInactiveMembers;
