exports.run = async (client, message, args) => {
    const functionsFile = client.functionsFile;
    let connection = client.connection;
    const config = client.config;
    const guild = message.guild;
    const modulesFile = client.modulesFile;
    const cryptoRandomString = client.cryptoRandomString;
    const channelsFile = client.channelsFile;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CLEAR')) {
            if (args.length >= 1) {
                let amount = 0;
                if (parseInt(args[0])) amount = parseInt(args[0]);
                else {
                    message.channel.send(':x: I could not parse that amount.').catch(console.error);
                    return;
                }
                let deleted = 0;
                if (args.length >= 2) {
                    const channelid = functionsFile.parseChannelTag(client, guild, args[1]);
                    if (args.length >= 3) {
                        const userid = functionsFile.parseUserTag(client, guild, args[2]);
                        let user = client.users.get(userid);
                        if (!user) {
                            try {
                                user = await client.fetchUser(userid);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        if (user) {
                            const channel = guild.channels.get(channelid);
                            if (channel) {
                                channel.fetchMessages({ limit: 100 }).then(async a => {
                                    await channel.bulkDelete(a.filter(b => b.author.id == user.id).first(amount)).then(result => (deleted = result.size)).catch(err => {
                                        if (err.code == 50034) message.channel.send(':x: You can only bulk delete messages that are under 14 days old.').catch(console.error);
                                        else console.error(err);
                                    });
                                    if (deleted > 0) {
                                        const identifier = cryptoRandomString({ length: 10 });
                                            message.channel.send({
                                                embed: {
                                                    color: config.color_success,
                                                    title: `[Action] Messages cleared`,
                                                    description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}.`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                        const data = [user.id, message.author.id, channel.id, deleted, identifier, new Date()];
                                        connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                        function (err, results) {
                                            if (err) {
                                                connection = functionsFile.establichConnection(client);
                                                connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                                function (err, results) {
                                                    if (err) throw err;
                                                });
                                            }
                                        });
                                    } else {
                                        message.channel.send('The command executed successfully but no messages were removed. Ensure the correct channel was used.').catch(console.error);
                                    }
                                }).catch(console.error);
                            } else {
                                message.channel.send(':x: I could not find that channel.').catch(console.error);
                            }
                        } else {
                            message.channel.send(':x: I could not find that user.').catch(console.error);
                        }
                    } else {
                        const channel = guild.channels.get(channelid);
                        if (channel) {
                            channel.fetchMessages({ limit: 100 }).then(async () => {
                                await channel.bulkDelete(amount).then(result => (deleted = result.size)).catch(err => {
                                    if (err.code == 50034) message.channel.send(':x: You can only bulk delete messages that are under 14 days old.').catch(console.error);
                                    else console.error(err);
                                });
                                if (deleted > 0) {
                                    const identifier = cryptoRandomString({ length: 10 });
                                    message.channel.send({
                                        embed: {
                                            color: config.color_success,
                                            title: `[Action] Messages cleared`,
                                            description: `The latest ${deleted} message(s) were removed from ${channel}.`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                    const data = [001, message.author.id, channel.id, deleted, identifier, new Date()];
                                    connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                    function (err, results) {
                                        if (err) {
                                            connection = functionsFile.establichConnection(client);
                                            connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                            function (err, results) {
                                                if (err) throw err;
                                            });
                                        }
                                    });
                                } else {
                                    message.channel.send('The command executed successfully but no messages were removed. Ensure the correct channel was used.').catch(console.error);
                                }
                            }).catch(console.error);
                        } else {
                            message.channel.send(':x: I could not find that channel.').catch(console.error);
                        }
                    }
                } else {
                    amount++;
                    const channel = message.channel;
                    channel.fetchMessages({ limit: 100 }).then(async () => {
                        await channel.bulkDelete(amount).then(result => (deleted = result.size - 1)).catch(err => {
                            if (err.code == 50034) message.channel.send(':x: You can only bulk delete messages that are under 14 days old.').catch(console.error);
                            else console.error(err);
                        });
                        if (deleted > 0) {
                            const identifier = cryptoRandomString({ length: 10 });
                            if (channelsFile.get('action_log') && guild.channels.get(channelsFile.get('action_log'))) {
                                guild.channels.get(channelsFile.get('action_log')).send({
                                    embed: {
                                        color: config.color_success,
                                        title: `[Action] Messages cleared`,
                                        description: `The latest ${deleted} message(s) were removed from ${channel}.`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                            }
                            const data = [001, message.author.id, channel.id, deleted, identifier, new Date()];
                            connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                            function (err, results) {
                                if (err) {
                                    connection = functionsFile.establichConnection(client);
                                    connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data,
                                    function (err, results) {
                                        if (err) throw err;
                                    });
                                }
                            });
                        } else {
                            message.channel.send('The command executed successfully but no messages were removed.').catch(console.error);
                        }
                    }).catch(console.error);
                }
            } else {
                functionsFile.syntaxErr(client, message, 'clear');
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}