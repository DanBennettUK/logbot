exports.run = async (client, message, args) => {
    const functionsFile = client.functionsFile;
    let connection = client.connection;
    const config = client.config;
    const guild = message.guild;
    const modulesFile = client.modulesFile;
    const cryptoRandomString = client.cryptoRandomString;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CLEAR')) {
            if (args.length >= 3) {
                const amount = args[0];
                const channelid = functionsFile.parseChannelTag(client, guild, args[1]);
                const userid = functionsFile.parseUserTag(client, guild, args[2]);

                const channel = await guild.channels.get(channelid);
                let user = client.users.get(userid);
                if (!user) {
                    try {
                        user = await client.fetchUser(userid);
                    } catch (e) {
                        console.log(e);
                    }
                }
                let deleted = 0;

                if (user && channel && guild.member(user)) {
                    channel.fetchMessages({ limit: 100 }).then(async a => {
                            await channel.bulkDelete(a.filter(b => b.author.id == user.id).first(parseInt(amount))).then(result => (deleted = result.size)).catch(console.error);
                            if (deleted > 0) {
                                const identifier = cryptoRandomString({ length: 10 });
                                message.channel.send({
                                        embed: {
                                            color: config.color_success,
                                            title: `[Action] Messages cleared`,
                                            description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}\n\nThis action was carried out by ${message.author}\n`,
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
                                message.channel.send('The command executed successfully but no messages were removed. Ensure the correct channel was used.').then(msg => {
                                    setTimeout(() => {
                                        msg.delete();
                                    }, 5000);
                                }).catch(console.error);
                            }
                        }).catch(console.error);
                } else {
                    message.channel.send('The user provided was not found in this guild').catch(console.error);
                }
            } else {
                functionsFile.syntaxErr(client, message, 'clear');
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}