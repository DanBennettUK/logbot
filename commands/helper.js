exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    const config = client.config;
    const guild = message.guild;
    const mutedFile = client.mutedFile;
    const _ = client.underscore;
    if (args[0] && args[0].toLowerCase() === 'clear') {
        if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            if (modulesFile.get('COMMAND_HELPER_CLEAR')) {
                if (args.length >= 4) {
                    var amount = args[1];
                    var channelid = functionsFile.parseChannelTag(client, guild, args[2]);
                    var userid = functionsFile.parseUserTag(client, guild, args[3]);

                    var channel = guild.channels.get(channelid);
                    var user = client.users.get(userid);
                    var deleted = 0;

                    if (user && guild.member(user)) {
                        channel.fetchMessages({ limit: 100 }).then(async a => {
                                await channel.bulkDelete(a.filter(b => b.author.id == user.id).first(parseInt(amount))).then(result => (deleted = result.size)).catch(console.error);
                                if (deleted > 0) {
                                    var identifier = cryptoRandomString({ length: 10 });
                                    guild.channels.find(chnl => chnl.name === 'helpers').send({
                                            embed: {
                                                color: config.color_success,
                                                title: `[Action] Messages cleared`,
                                                description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}\n\nThis action was carried out by ${message.author}\n`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        });
                                    var data = [user.id, message.author.id, channel.id, deleted, identifier, new Date()];
                                    connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                    function (err, results) {
                                        if (err) throw err;
                                    });
                                } else {
                                    message.channel.send('The command executed successfully but no messages were removed. Ensure the correct channel was used.').then(msg => {
                                        setTimeout(() => {
                                            msg.delete();
                                        }, 5000);
                                    }).catch(console.error);
                                }
                            }).catch(console.error);
                    } else {
                        message.channel.send('The user provided was not found in this guild');
                    }
                } else {
                    syntaxErr(client, message, 'helper clear');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (args[0] && args[0].toLowerCase() === 'mute') {
        if (message.member.roles.some(role => ['Support'].includes(role.name))) {
            if (modulesFile.get('COMMAND_HELPER_MUTE')) {
                if (args[1]) {
                    var user = functionsFile.parseUserTag(client, guild, args[1]);
                    var guildUser = guild.member(user);

                    if (user !== 'err' && guildUser) {
                        if (mutedFile.get(user)) {
                            var existingMute = mutedFile.get(user);
                            message.channel.send(`${client.users.get(user)} already has an active mute. This will end at ${new Date(existingMute.end * 1000).toUTCString()}`);
                        } else {
                            if (parseInt(args[2])) {
                                if (args[2] <= 5) {
                                    var end = Math.floor(Date.now() / 1000) + args[2] * 60;
                                    var seconds = args[2] * 60;

                                    var tail = _.rest(args, 3).join(' ');

                                    if (tail.length > 0) {
                                        var reason = `${tail.charAt(0).toUpperCase()}${tail.slice(1)}`
                                        mutedFile.set(`${user}.end`, end);
                                        mutedFile.set(`${user}.actioner`,  message.author.id);
                                        mutedFile.set(`${user}.actionee`, user);
                                        mutedFile.set(`${user}.reason`, reason);
                                        mutedFile.set(`${user}.isHelper`, 1);
                                        mutedFile.save();

                                        var mutedRole = guild.roles.find(val => val.name === 'Muted');
                                        var identifier = cryptoRandomString({ length: 10 });

                                        guild.member(user).addRole(mutedRole).then(member => {
                                            if (member.voiceChannel !== undefined) {
                                                member.setVoiceChannel(null).catch(console.error);
                                            }

                                            message.channel.send({
                                                embed: {
                                                    color: config.color_success,
                                                    author: {
                                                        name: client.user.username,
                                                        icon_url: client.user.displayAvatarURL
                                                    },
                                                    title: '[Action] User Muted',
                                                    description: `${member} was muted by ${message.author} for ${args[2]}m`,
                                                    fields: [
                                                        {
                                                            name: 'Reason',
                                                            value: reason
                                                        },
                                                        {
                                                            name: 'Identifier',
                                                            value: identifier,
                                                            inline: true
                                                        },
                                                        {
                                                            name: 'Note',
                                                            value: `I also attempted to disconnect the user from their voice channel`,
                                                            inline: true
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                            var data = [user, message.author.id, reason, seconds, identifier, 0, new Date()];
                                            connection.query('INSERT INTO log_mutes(userID, actioner, description, length, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?,?)', data,
                                            function (err, results) {
                                                if (err) throw err;
                                            });

                                            member.createDM().then(async chnl => {
                                                await chnl.send({
                                                    embed: {
                                                        color: config.color_caution,
                                                        title: `You have been muted in ${guild.name}`,
                                                        description: `Details regarding the mute can be found below:`,
                                                        fields: [
                                                            {
                                                                name: 'Reason',
                                                                value: reason,
                                                                inline: true
                                                            },
                                                            {
                                                                name: 'Length',
                                                                value: `${args[2]}m`,
                                                                inline: true
                                                            },
                                                            {
                                                                name: 'Identifier',
                                                                value: `\`${identifier}\``
                                                            },
                                                            {
                                                                name: 'Want to dispute?',
                                                                value: 'This mute can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
                                                            }
                                                        ],
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                                        }
                                                    }
                                                }).then(dm => {
                                                    if (dm.embeds[0].type === 'rich') {
                                                        var data = [user, dm.embeds[0].title, 3, 0, identifier, new Date(), new Date()];
                                                    } else {
                                                        var data = [ user, dm.content, 3, 0, identifier, new Date(), ];
                                                    }
                                                    connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data,
                                                    function (err, results) {
                                                        if (err)
                                                            throw err;
                                                    });
                                                });
                                            }).catch(console.error);
                                        }).catch(console.error);
                                    } else {
                                        message.channel.send('Please provide a reason for the mute.');
                                    }
                                } else {
                                    message.channel.send('That mute length is too long.');
                                }
                            } else {
                                message.channel.send(`Hm, that length doesn't seem right? ${args[2]}`);
                                return;
                            }
                        }
                    } else {
                        message.channel.send('The user provided was not found.');
                    }
                } else functionsFile.syntaxErr(client, message, 'helper mute');
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }
}