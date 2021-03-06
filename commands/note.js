exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const cryptoRandomString = client.cryptoRandomString;
    var connection = client.connection;
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_NOTE')) {
            let id = '';
            if (args[0]) {
                id = functionsFile.parseUserTag(client, message.guild, args[0]);
            } else {
                message.channel.send(`Format: \`${config.prefix}note [User ID] [Note content]\``);
                return;
            }

            if (id == 'err') {
                message.channel.send(':x: An invalid user was provided. Please try again').catch(console.error);
            } else {
                let user = client.users.get(id);
                if (!user) {
                    try {
                        user = await client.fetchUser(id);
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (!user) {
                    message.channel.send(':x: An invalid user was provided. Please try again').catch(console.error);
                    return;
                }
                const tail = args.slice(1);
                const note = `${tail.join(' ').trim().charAt(0).toUpperCase()}${tail.join(' ').trim().slice(1)}`;

                if (tail.length > 0) {
                    const identifier = cryptoRandomString({ length: 10 });
                    const data = [id, message.author.id, note, identifier, 0, new Date(), id];
                    connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                    function (err, results) {
                        if (err) {
                            connection = functionsFile.establishConnection(client);
                            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                            function (err, results) {
                                if (err) throw err;
                                message.channel.send({
                                    embed: {
                                        color: config.color_success,
                                        title: '[Action] Note added',
                                        description: `A note was added to ${user} by ${message.author}`,
                                        fields: [
                                            {
                                                name: 'Content',
                                                value: note
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
                            });
                        } else {
                            message.channel.send({
                                embed: {
                                    color: config.color_success,
                                    title: '[Action] Note added',
                                    description: `A note was added to ${user} by ${message.author}`,
                                    fields: [
                                        {
                                            name: 'Content',
                                            value: note
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
                        }
                    });
                } else {
                    message.channel.send('The note needs a reason!');
                }
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}