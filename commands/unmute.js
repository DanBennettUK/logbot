exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const mutedFile = client.mutedFile;
    const guild = message.guild;
    const functionsFile = client.functionsFile;
    const config = client.config;
    const _ = client.underscore;
    const cryptoRandomString = client.cryptoRandomString;
    let connection = client.connection;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_UNMUTE')) {
            if (args[0]) {
                const user = functionsFile.parseUserTag(client, guild, args[0]);
                const guildUser = guild.member(user);

                if (user !== 'err' && guildUser) {
                    if ((mutedFile.get(user)) || (guild.members.get(user).roles.some(r => r.name === 'Muted'))) {
                        const tail = _.rest(args, 1).join(' ');

                        if (tail.length > 0) {

                            const reason = `${tail.charAt(0).toUpperCase()}${tail.slice(1)}`

                            mutedFile.unset(`${user}`);
                            mutedFile.save();

                            const mutedRole = guild.roles.find(val => val.name === 'Muted');
                            const identifier = cryptoRandomString({ length: 10 });

                            guild.member(user).removeRole(mutedRole).then(member => {
                                let data = [user, message.author.id, reason, identifier, 0, new Date(), user /*SP arg*/];
                                connection.query('INSERT INTO log_unmutes(userID, actioner, description, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?);',
                                data, function (err, results) {
                                    if (err) {
                                        connection = functionsFile.establishConnection(client);
                                        connection.query('INSERT INTO log_unmutes(userID, actioner, description, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?);',
                                        data, function (err, results) {
                                            if (err) throw err;
                                            message.channel.send({
                                                embed: {
                                                    color: config.color_success,
                                                    author: {
                                                        name: client.user.username,
                                                        icon_url: client.user.displayAvatarURL
                                                    },
                                                    title: '[Action] User Unmuted',
                                                    description: `${member} was unmuted by ${message.author}.`,
                                                    fields: [
                                                        {
                                                            name: 'Reason',
                                                            value: reason,
                                                            inline: true
                                                        },
                                                        {
                                                            name: 'Identifier',
                                                            value: identifier,
                                                            inline: true
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                        });
                                    } else {
                                        message.channel.send({
                                            embed: {
                                                color: config.color_success,
                                                author: {
                                                    name: client.user.username,
                                                    icon_url: client.user.displayAvatarURL
                                                },
                                                title: '[Action] User Unmuted',
                                                description: `${member} was unmuted by ${message.author}.`,
                                                fields: [
                                                    {
                                                        name: 'Reason',
                                                        value: reason,
                                                        inline: true
                                                    },
                                                    {
                                                        name: 'Identifier',
                                                        value: identifier,
                                                        inline: true
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    }
                                });
                                member.createDM().then(async chnl => {
                                    await chnl.send({
                                        embed: {
                                            color: config.color_info,
                                            title: `You have been unmuted in ${guild.name}`,
                                            description: `Details regarding the unmute can be found below:`,
                                            fields: [
                                                {
                                                name: 'Reason',
                                                value: reason,
                                                inline: true
                                                },
                                                {
                                                name: 'Identifier',
                                                value: `\`${identifier}\``,
                                                inline: true
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).then(dm => {
                                        if (dm.embeds[0].type === 'rich') {
                                            data = [user, dm.embeds[0].title, 3, 0, identifier, new Date(), new Date()];
                                        } else {
                                            data = [user, dm.content, 3, 0, identifier, new Date(), new Date()];
                                        }
                                        connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data, function (err, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data, function (err, results) {
                                                    if (err) throw err;
                                                });
                                            }
                                        });
                                    }).catch(console.error);
                                }).catch(console.error);
                            }).catch(console.error);
                        } else {
                            message.channel.send('Please provide a reason for the unmute.');
                        }
                    } else {
                    message.channel.send(`${client.users.get(user)} does not have an active mute.`);
                    }
                } else {
                    message.channel.send('The user provided was not found.');
                }
            } else functionsFile.syntaxErr(client, message, 'unmute');
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}