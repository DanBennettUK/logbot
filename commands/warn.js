exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const guild = message.guild;
    const connection = client.connection;
    const cryptoRandomString = client.cryptoRandomString;
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_WARN')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(client, guild, args[0]);
            } else {
                functionsFile.syntaxErr(client, message, 'warn');
                return;
            }

            if (user == 'err') {
                message.channel.send('An invalid user was provided. Please try again');
            } else {
                if (guild.member(user)) {
                    var tail = args.slice(1);

                    if (tail.length > 0) {
                        var content = `${tail.join(' ').trim().charAt(0).toUpperCase()}${tail.join(' ').trim().slice(1)}`;
                        var identifier = cryptoRandomString({ length: 10 });
                        var data = [user, message.author.id, content, identifier, 0, new Date(), user /*SP arg*/];
                        connection.query('INSERT INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?); CALL user_totalRecords(?, @total)', data,
                        async function (err, results) {
                            if (err) throw err;

                            message.channel.send({
                                embed: {
                                    color: config.color_success,
                                    author: {
                                        name: client.user.username,
                                        icon_url: client.user.displayAvatarURL
                                    },
                                    title: '[Action] Warning added',
                                    description: `A warning was added to ${client.users.get(user)} by ${message.author}. User now has **${results[1][0].total}** records `,
                                    fields: [
                                        {
                                            name: 'Reason',
                                            value: content
                                        },
                                        {
                                            name: 'Identifier',
                                            value: identifier
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            });
                            try {
                                var chnl = await client.users.get(user).createDM();
                                    await chnl.send({
                                            embed: {
                                                color: config.color_caution,
                                                title: `You have been warned in ${guild.name}`,
                                                description: `Details about the warning can be found below:`,
                                                fields: [{
                                                        name: 'Reason',
                                                        value: content
                                                    },
                                                    {
                                                        name: 'Identifier',
                                                        value: `\`${identifier}\``
                                                    },
                                                    {
                                                        name: 'Want to dispute?',
                                                        value: 'This warning can be disputed reasonably by contacting ModMail (<@407690548401405962>). Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).then(dm => {
                                            var data = [user, dm.content, 1, 0, identifier, new Date(), new Date()];
                                            connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                                function (err, results) {
                                                    if (err) throw err;
                                                }
                                            );
                                        });
                            } catch (e) {
                                message.channel.send(':x: I could not reach that user via DM. They may have DMs turned off or have me blocked.');
                            }
                        });
                    } else {
                        message.channel.send('The warning needs a reason!');
                    }
                } else {
                    message.channel.send('The user provided was not found in this guild');
                }
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}