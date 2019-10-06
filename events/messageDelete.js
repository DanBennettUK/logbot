module.exports = async (client, message) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    if (modulesFile.get('EVENT_MESSAGE_DELETE')) {
        if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [message.author.id, message.id, '', message.content, message.channel.id, 3, new Date()];
        connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
            function (err, results) {
                if (err) throw err;
            }
        );
        if (modulesFile.get('EVENT_MESSAGE_DELETE_LOG')) {
            const entry = await message.guild.fetchAuditLogs({
                type: 'MESSAGE_DELETE'
            }).then(audit => audit.entries.first());
            var user = '';
            if (entry.extra.channel.id === message.channel.id &&
            (entry.target.id == message.author.id) && (entry.createdTimestamp > (Date.now() - 5000))) {
                user = entry.executor
            } else user = message.author;
            var messageContent = message.content;
            if (message.content.length == 0) messageContent = message.attachments.first().filename;
            if (message.content.length > 2000) messageContent = 'Message too long ( > 2000 characters)';
            message.guild.channels.get(config.channel_serverlog).send({
                embed: {
                    color: config.color_warning,
                    author: {
                        name: `${message.author.username}#${message.author.discriminator}`,
                        icon_url: message.author.displayAvatarURL
                    },
                    title: 'Message deletion',
                    description: `Message sent by user ${message.author} deleted in ${message.channel}\n`,
                    fields: [
                        {
                            name: 'Deleted by',
                            value: `${user}`
                        },
                        {
                            name: 'Deleted message',
                            value: messageContent
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        }
    }
}