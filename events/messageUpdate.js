module.exports = (client, oldMessage, newMessage) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    const channelsFile = client.channelsFile;
    if (modulesFile.get('EVENT_MESSAGE_UPDATE')) {
        if (newMessage.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [newMessage.author.id, newMessage.id, newMessage.content, oldMessage.content, newMessage.channel.id, 2, new Date()];
        connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
            function (err, results) {
                if (err) throw err;
            }
        );
        if (channelsFile.get('server_log')) {
            if (!oldMessage.guild.channels.get(channelsFile.get('server_log'))) {
                return;
            }
            if (modulesFile.get('EVENT_MESSAGE_UPDATE_LOG')) {
                if (oldMessage.content == newMessage.content) return;
                if (oldMessage.content.length < 1024 && newMessage.content.length < 900) {
                    oldMessage.guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${oldMessage.author.username}#${oldMessage.author.discriminator}`,
                                icon_url: oldMessage.author.displayAvatarURL,
                            },
                            title: `Message edit`,
                            description: `Message sent by ${oldMessage.author} (${oldMessage.author.username}#${oldMessage.author.discriminator} ${oldMessage.author.id}) edited in ${oldMessage.channel}\n`,
                            fields: [
                                {
                                    name: 'Old message',
                                    value: `${oldMessage}`
                                },
                                {
                                    name: 'New message',
                                    value: `${newMessage}\n[Jump to Message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`
                                }
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                } else {
                    if (oldMessage.content.length < 1024 && newMessage.content.length > 900) {
                        oldMessage.guild.channels.get(channelsFile.get('server_log')).send({
                            embed: {
                                color: config.color_info,
                                author: {
                                    name: `${oldMessage.author.username}#${oldMessage.author.discriminator}`,
                                    icon_url: oldMessage.author.displayAvatarURL,
                                },
                                title: 'Message edit',
                                description: `Message sent by ${oldMessage.author} (${oldMessage.author.username}#${oldMessage.author.discriminator} ${oldMessage.author.id}) edited in ${oldMessage.channel}\n`,
                                fields: [
                                    {
                                        name: 'Old message',
                                        value: `${oldMessage}`
                                    },
                                    {
                                        name: 'New message',
                                        value: `[Jump to Message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    } else {
                        oldMessage.guild.channels.get(channelsFile.get('server_log')).send({
                            embed: {
                                color: config.color_info,
                                author: {
                                    name: `${oldMessage.author.username}#${oldMessage.author.discriminator}`,
                                    icon_url: oldMessage.author.displayAvatarURL,
                                },
                                title: 'Message edit',
                                description: `Message sent by ${oldMessage.author} (${oldMessage.author.username}#${oldMessage.author.discriminator} ${oldMessage.author.id}) edited in ${oldMessage.channel}\n`,
                                fields: [
                                    {
                                        name: 'New message',
                                        value: `[Jump to Message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`
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
        }
    }
}