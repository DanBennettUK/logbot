exports.run = (client, message, args) => {
    const guild = message.guild;
    const modulesFile = client.modulesFile;
    const cryptoRandomString = client.cryptoRandomString;
    const functionsFile = client.functionsFile;
    const mutedFile = client.mutedFile;
    const _ = client.underscore;
    const config = client.config;
    const connection = client.connection;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_MUTE')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(client, guild, args[0]);
                var guildUser = guild.member(user);

                if (user !== 'err' && guildUser) {
                    if (mutedFile.get(user)) {
                        var existingMute = mutedFile.get(user);
                        message.channel.send(`${client.users.get(user)} already has an active mute. This will end at ${new Date(existingMute.end * 1000)}`);
                    } else {
                        var end;
                        var seconds;
                        var int = args[1].replace(/[a-zA-Z]$/g, '');

                        if (parseInt(int)) {
                            switch (args[1] && args[1].toLowerCase().charAt(args[1].length - 1)) {
                                case 'd':
                                    end = Math.floor(Date.now() / 1000) + int * 24 * 60 * 60;
                                    seconds = int * 24 * 60 * 60;
                                    break;
                                case 'h':
                                    end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                                    seconds = int * 60 * 60;
                                    break;
                                case 'm':
                                    end = Math.floor(Date.now() / 1000) + int * 60;
                                    seconds = int * 60;
                                    break;
                                default:
                                    end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                                    seconds = int * 60 * 60;
                                    break;
                            }

                            var reason = _.rest(args, 2).join(' ');

                            if (reason.length > 0) {
                                mutedFile.set(`${user}.end`, end);
                                mutedFile.set(`${user}.actioner`,message.author.id);
                                mutedFile.set(`${user}.actionee`, user);
                                mutedFile.set(`${user}.reason`, reason);
                                mutedFile.set(`${user}.isHelper`, 0);
                                mutedFile.save();

                                var mutedRole = guild.roles.find(val => val.name === 'Muted');
                                var identifier = cryptoRandomString({ length: 10 });

                                guild.member(user).addRole(mutedRole).then(async member => {
                                    if (member.voiceChannel !== undefined) {
                                        member.setVoiceChannel(null)
                                    }

                                    var data = [user, message.author.id, reason, seconds, identifier, 0, new Date(), user /*SP arg*/];
                                    connection.query('INSERT INTO log_mutes(userID, actioner, description, length, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?,?); CALL user_totalRecords(?, @total)', data,
                                    function (err, results) {
                                        if (err) throw err;

                                        message.channel.send({
                                            embed: {
                                                color: config.color_success,
                                                author: {
                                                    name: client.user.username,
                                                    icon_url: client.user.displayAvatarURL
                                                },
                                                title: '[Action] User Muted',
                                                description: `${member} was muted by ${message.author} for ${args[1]}. User now has **${results[1][0].total}** records`,
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
                                    });

                                    try {
                                        var chnl = await member.createDM();
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
                                                            value: args[1],
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
                                                    var data = [user, dm.content, 3, 0, identifier, new Date(), new Date()];
                                                }
                                                connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                                    function (err, results) {
                                                        if (err) throw err;
                                                    }
                                                );
                                            });
                                    } catch (e) {
                                        message.channel.send(':x: I could not reach that user via DM. They may have DMs turned off or have me blocked.');
                                    }
                                }).catch(console.error);
                            } else {
                                message.channel.send('Please provide a reason for the mute.');
                            }
                        } else {
                            message.channel.send( `Hm, that length doesn't seem right? ${int}`);
                            return;
                        }
                    }
                } else {
                    message.channel.send('The user provided was not found.');
                }
            } else functionsFile.syntaxErr(client, message, 'mute');
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}