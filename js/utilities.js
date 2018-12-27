const { dccrew } = require('../config.json');

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

exports.getNMessagesFromChannel = getNMessagesFromChannel;