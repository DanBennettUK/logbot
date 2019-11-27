module.exports = (client, oldMessage, newMessage) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const config = client.config;
    const channelsFile = client.channelsFile;
    const functionsFile = client.functionsFile;
    const _ = client.underscore;

    if (_.indexOf(['dm', 'group'], newMessage.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.


    if (modulesFile.get('EVENT_CHECK_MESSAGE_CONTENT')) {
        functionsFile.checkMessageContent(client, newMessage);
    }
    if (modulesFile.get('EVENT_INVITE_LINK_DETECTION')) {
        functionsFile.inviteLinkDetection(client, newMessage);
    }

    if (modulesFile.get('EVENT_MESSAGE_UPDATE')) {
        if (newMessage.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [newMessage.author.id, newMessage.id, newMessage.content, oldMessage.content, newMessage.channel.id, 2, new Date()];
        connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
            function (err, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
                    function (err, results) {
                        if (err) throw err;
                    });
                }
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
                                    value: `${oldMessage.content}`
                                },
                                {
                                    name: 'New message',
                                    value: `${newMessage.content}\n[Jump to Message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`
                                }
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
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
                                        value: `${oldMessage.content}`
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
                        }).catch(console.error);
                    } else {
                        if (oldMessage.content.length < 1800) {
                            oldMessage.guild.channels.get(channelsFile.get('server_log')).send({
                                embed: {
                                    color: config.color_info,
                                    author: {
                                        name: `${oldMessage.author.username}#${oldMessage.author.discriminator}`,
                                        icon_url: oldMessage.author.displayAvatarURL,
                                    },
                                    title: 'Message edit',
                                    description: `Message sent by ${oldMessage.author} (${oldMessage.author.username}#${oldMessage.author.discriminator} ${oldMessage.author.id}) edited in ${oldMessage.channel}\n
                                    **Old message:**\n ${oldMessage.content}\n\n[New message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`,
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
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
                            }).catch(console.error);
                        }
                    }
                }
            }
        }
    }
}