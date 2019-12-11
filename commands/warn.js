exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const guild = message.guild;
    let connection = client.connection;
    const cryptoRandomString = client.cryptoRandomString;
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_WARN')) {
            let user;
            if (args[0]) {
                user = functionsFile.parseUserTag(client, guild, args[0]);
            } else {
                functionsFile.syntaxErr(client, message, 'warn');
                return;
            }

            if (user == 'err') {
                message.channel.send('An invalid user was provided. Please try again');
            } else {
                if (guild.member(user)) {
                    const tail = args.slice(1);

                    if (tail.length > 0) {
                        const content = `${tail.join(' ').trim().charAt(0).toUpperCase()}${tail.join(' ').trim().slice(1)}`;
                        const identifier = cryptoRandomString({ length: 10 });
                        let data = [user, message.author.id, content, identifier, 0, new Date(), user /*SP arg*/];
                        connection.query('INSERT INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?); CALL user_totalRecords(?, @total)', data,
                        async function (err, results) {
                            if (err) {
                                connection = functionsFile.establishConnection(client);
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
                                    }).catch(console.error);
                                    client.users.get(user).createDM().then(chnl => {
                                        chnl.send({
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
                                            data = [user, dm.content, 1, 0, identifier, new Date(), new Date()];
                                            connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                                function (err, results) {
                                                    if (err) {
                                                        connection = functionsFile.establishConnection(client);
                                                        connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                                        function (err, results) {
                                                            if (err) throw err;
                                                        });
                                                    }
                                                }
                                            );
                                        }).catch(error => {
                                            if (error.message == 'Cannot send messages to this user') message.channel.send(':x: I could not reach that user via DM. They may have DMs turned off or have me blocked.').catch(console.error);
                                            else console.error;
                                        });
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
                                }).catch(console.error);
                                client.users.get(user).createDM().then(chnl => {
                                    chnl.send({
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
                                        data = [user, dm.content, 1, 0, identifier, new Date(), new Date()];
                                        connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                            function (err, results) {
                                                if (err) {
                                                    connection = functionsFile.establishConnection(client);
                                                    connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data,
                                                    function (err, results) {
                                                        if (err) throw err;
                                                    });
                                                }
                                            }
                                        );
                                    }).catch(error => {
                                        if (error.message == 'Cannot send messages to this user') message.channel.send(':x: I could not reach that user via DM. They may have DMs turned off or have me blocked.').catch(console.error);
                                        else console.error;
                                    });
                                }).catch(console.error);
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
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}