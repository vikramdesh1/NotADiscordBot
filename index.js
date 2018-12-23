const Discord = require('discord.js');
const {
    prefix,
    token,
    dccrew
} = require('./config.json');
const client = new Discord.Client();
const schedule = require('node-schedule');

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
        purgeInactiveGeneralMembers();
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

async function purgeInactiveGeneralMembers() {
    const allMessages = [];
    let lastMessageId;
    let messages;
    const scores = [];
    let today = new Date();
    let oneMonthAgo;
    let messageDate;
    let breakFlag = false;
    if (today.getMonth() == 0) {
        oneMonthAgo = new Date(today.getYear() - 1, 11, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    } else {
        oneMonthAgo = new Date(today.getYear(), today.getMonth() - 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    }
    do {
        messages = await getNMessagesFromChannel(100, dccrew.general, lastMessageId);
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
    const embed = new Discord.RichEmbed();
    embed.setTitle('The Purge');
    embed.setDescription('DC Crew\'s monthly purge - ' + new Date().toDateString());
    embed.setColor('0xFF0000');
    let scoresMessage = '';
    let survivorsMessage = '';
    let kickedMessage = '';
    scoresMessage += 'The following are message counts for the last month :calendar_spiral: \n';
    scores.forEach(score => {
        scoresMessage += score.name + ' : ' + score.score + '\n';
        if (score.score == 0) {
            kickedMessage += score.name + ', ';
        } else {
            survivorsMessage += score.name + ', ';
        }
    })
    embed.addField('Scores', scoresMessage);
    embed.addField('Survivors', survivorsMessage.slice(0, -2));
    embed.addField('Kicked', kickedMessage.slice(0, -2));
    embed.addField(':skull_crossbones:', 'Until next time!');
    client.guilds.get(dccrew.id).channels.get(dccrew.testinggrounds).send(embed);
    scores.forEach(s => {
        if (s.score == 0) {
            /* client.guilds.get(dccrew.id).members.get(s.id).kick('Inactive on general for 1 month').then(() => {
                console.log('Kicked ' + s.name + ' for inactivity')
            }).catch(error => console.error(error)); */
        }
    });
    console.log(scores);
}

function getNMessagesFromChannel(numberOfMessages, channel, lastMessageId) {
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

client.login(token);