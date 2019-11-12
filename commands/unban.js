exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const cryptoRandomString = client.cryptoRandomString;
    const guild = message.guild;
    const functionsFile = client.functionsFile;
    var connection = client.connection;
    const bannedUsersFile = client.bannedUsersFile;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_UNBAN')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(client, guild, args[0]);
            } else {
                message.channel.send(`Unban who?\n Format:\`${config.prefix}unban <UserTag> <Reason>\``);
                return;
            }

            if (user == 'err') {
                //Check if the user parameter is valid
                message.channel.send(':thinking: An invalid user was provided. Please try again');
            } else {
                if (client.fetchUser(user)) {
                    var tail = args.slice(1);
                    var reason = tail.join(' ').trim();

                    if (tail.length > 0) {
                        guild.unban(user, reason).then(result => {
                            var identifier = cryptoRandomString({ length: 10 });
                            message.channel.send({
                                embed: {
                                    color: config.color_success,
                                    author: {
                                        name: client.user.username,
                                        icon_url: client.user.displayAvatarURL
                                    },
                                    title: `[Action] Unban`,
                                    description: `The user provided has been successfully unbanned`,
                                    fields: [
                                        {
                                            name: 'ID',
                                            value: result.id,
                                            inline: true
                                        },
                                        {
                                            name: 'Username/Discrim',
                                            value: `${result.username}#${result.discriminator}`,
                                            inline: true
                                        },
                                        {
                                            name: 'Reason',
                                            value: reason
                                        },
                                        {
                                            name: 'Unbanned by',
                                            value: message.author.username
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

                            var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                            connection.query('INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                            function (err, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query('INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                    function (err, results) {
                                        if (err) throw err;
                                    });
                                }
                            });
                            connection.query( 'select identifier from log_guildbans where userid = ? order by timestamp desc limit 1', result.id,
                            function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query( 'select identifier from log_guildbans where userid = ? order by timestamp desc limit 1', result.id,
                                    function (err, rows, results) {
                                        if (err) throw err;
                                        bannedUsersFile.set(rows[0].identifier, '');
                                        bannedUsersFile.save();
                                    });
                                } else {
                                    bannedUsersFile.set(rows[0].identifier, '');
                                    bannedUsersFile.save();
                                }
                            });
                        }).catch(err => {
                            if (err.message === 'Unknown Ban') {
                                message.channel.send('That user doesn\'t appear to be banned');
                            } else {
                                console.log(err);
                            }
                        });
                    } else {
                        message.channel.send('Please provide a reason for the unban');
                    }
                } else {
                    message.channel.send('Could not find a Discord user with that tag/ID');
                }
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}