exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const config = client.config;
    const guild = message.guild;
    var connection = client.connection;
    const bannedUsersFile = client.bannedUsersFile;
    if (message.member.roles.some(role=>['Moderators'].includes(role.name))) {
        if(modulesFile.get('COMMAND_BAN')) {
            if(args[0]) {
                var user = functionsFile.parseUserTag(client, guild, args[0]);

                if (user == 'err') { //Check if the user parameter is valid
                message.channel.send('An invalid user was provided. Please try again');
                } else {
                    if (guild.member(user)) { //Check if the user exists in the guild
                        if (message.member.highestRole.comparePositionTo(guild.member(user).highestRole) > 0) {
                            var tail = args.slice(1);
                            var reason = `${tail.join(" ").trim().charAt(0).toUpperCase()}${tail.join(" ").trim().slice(1)}`;

                            if (tail.length > 0) {
                                var identifier = cryptoRandomString({length: 10});
                                var chnl = await client.users.get(user).createDM();
                                try {
                                    await chnl.send({
                                        embed: {
                                            color: config.color_warning,
                                            title:`You have been banned from ${guild.name} for breaking one or more of the rules` ,
                                            fields: [
                                                {
                                                    name: 'Reason',
                                                    value: `${reason}`
                                                },
                                                {
                                                    name: 'Want to dispute?',
                                                    value: `This ban can be disputed reasonably by contacting us via our [subreddit modmail](https://www.reddit.com/message/compose?to=/r/PUBATTLEGROUNDS&subject=[${identifier}]%20Discord%20Ban%20Appeal&message=[Please%20use%20this%20message%20box%20to%20explain%20your%20side%20of%20the%20ban,%20including%20any%20evidence.%20Please%20do%20not%20change%20the%20subject%20of%20this%20message.])`
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).then(dm => {
                                        var data = [user, `Title: ${dm.embeds[0].title}`, 2, 0, identifier, new Date(), new Date()];
                                        connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data,
                                        function(err, results) {
                                            if(err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data,
                                                function(err, results) {
                                                    if(err) throw err;
                                                });
                                            }
                                        });
    
                                        guild.ban(user, { days: 1, reason: reason }).then(async result => {
                                            await message.channel.send({
                                                embed: {
                                                    color: config.color_success,
                                                    author: {
                                                        name: client.user.username,
                                                        icon_url: client.user.displayAvatarURL
                                                    },
                                                    title: `[Action] Ban`,
                                                    description: `${client.users.get(user)} has been successfully banned`,
                                                    fields: [
                                                        {
                                                            name: 'User ID',
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
                                                            name: 'Banned by',
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
                                            connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                            function(err, results) {
                                                if(err) {
                                                    connection = functionsFile.establishConnection(client);
                                                    connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                                    function(err, results) {
                                                        if (err) throw err;
                                                    });
                                                }
                                            });
    
                                            //Adding the user to our banned users JSON
                                            bannedUsersFile.set(identifier, result.username);
                                            bannedUsersFile.save();
                                        }).catch(console.error);
                                    }).catch(console.error);
                                } catch (e) {
                                    guild.ban(user, { days: 1, reason: reason }).then(async result => {
                                        await message.channel.send({
                                            embed: {
                                                color: config.color_success,
                                                author: {
                                                    name: client.user.username,
                                                    icon_url: client.user.displayAvatarURL
                                                },
                                                title: `[Action] Ban`,
                                                description: `${client.users.get(user)} has been successfully banned`,
                                                fields: [
                                                    {
                                                        name: 'User ID',
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
                                                        name: 'Banned by',
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

                                        message.channel.send(':x: I could not reach that user via DM. They may have DMs turned off or have me blocked.');


                                        var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                                        connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                        function(err, results) {
                                            if(err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                                function(err, results) {
                                                    if (err) throw err;
                                                });
                                            }
                                        });

                                        //Adding the user to our banned users JSON
                                        bannedUsersFile.set(identifier, result.username);
                                        bannedUsersFile.save();
                                    }).catch(console.error);
                                }
                                
                            }
                            else {
                                message.channel.send('Please provide a reason for the ban');
                            }
                        } else message.channel.send('You can not ban a user with a higher role than yourself');
                    } else { // if the user isn't in the guild, have a confirmation message and proceed upon reacting
                        if (client.fetchUser(user)) {
                            await client.fetchUser(user).then(async userObj =>{
                                await message.channel.send(`User ${userObj} is not in the guild. Are you sure you want to proceed?`).then(async msg => {
                                    await msg.react('✅');
                                    await msg.react('❌');

                                    const filter = (reaction, user) => user == message.member.user;
                                    const collector = msg.createReactionCollector(filter);

                                    collector.on('collect', async react => {
                                        if (react.emoji.name == '✅') {
                                            await msg.delete();
                                            var tail = args.slice(1);
                                            var reason = `${tail.join(" ").trim().charAt(0).toUpperCase()}${tail.join(" ").trim().slice(1)}`;

                                            if (tail.length > 0) {
                                                var identifier = cryptoRandomString({length: 10});
                                                guild.ban(user, { days: 1, reason: reason }).then(async result => {
                                                    await message.channel.send({
                                                        embed: {
                                                            color: config.color_success,
                                                            author: {
                                                            name: client.user.username,
                                                            icon_url: client.user.displayAvatarURL
                                                            },
                                                            title: `[Action] Ban` ,
                                                            description: `${client.users.get(user)} has been successfully banned`,
                                                            fields: [
                                                                {
                                                                    name: 'User ID',
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
                                                                    name: 'Banned by',
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
                                                    });
                                                    var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                                                    connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                                    function(err, results) {
                                                        if(err) {
                                                            connection = functionsFile.establishConnection(client);
                                                            connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                                            function(err, results) {
                                                                if (err) throw err;
                                                            });
                                                        }
                                                    });

                                                    //Adding the user to our banned users JSON
                                                    bannedUsersFile.set(identifier, result.username);
                                                    bannedUsersFile.save();
                                                }).catch(console.error);
                                            }
                                        }
                                        if (react.emoji.name == '❌') {
                                            await msg.delete();
                                            message.channel.send('Action cancelled').then(msg2 => {
                                                setTimeout(function() {msg2.delete();}, 5000);
                                            }).catch(console.error);
                                        }
                                    });
                                });
                            });
                        }
                    }
                }
            } else {
                functionsFile.syntaxErr(client, message, 'ban');
                return;
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}