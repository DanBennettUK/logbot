module.exports = (client, message) => {
    if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    if (_.indexOf(['dm', 'group'], message.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.

    //Log every message that is processed; message or command.
    var data = [message.author.id, message.id, message.content, '', message.channel.id, 1, new Date()];
    connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
        function (err, results) {
            if (err) throw err;
        }
    );

    if (modulesFile.get('EVENT_CHECKMESSAGECONTENT')) {
        checkMessageContent(message);
    }

    if ((!message.content.startsWith(config.prefix) || message.content.startsWith(`${config.prefix} `))) return; //If the message content doesn't start with our prefix, return.

    if (!(_.keys(badWordsFile.read()).length > 0)) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
    }

    const args = message.content.slice(1).trim().split(/\s+/); //Result: ["<TAG>", "Bad", "person!"]
    const command = args.shift().toLowerCase(); //Result: "ban"

    var publicCommands = ['bugreport', 'forums', 'official', 'report', 'roc', 'support', 'wiki', 'mobile', 'lite'];

    if (_.keys(customCommands.read()).includes(command)) {
        if (publicCommands.includes(command) || message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            var obj = customCommands.get(command);
            message.channel.send(`${obj.content}`);
            message.delete();
        }
    }

     if (command === 'user') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_USER')) {
                var userID = parseUserTag(args[0]);
                var globalUser;
                try {
                    globalUser = await client.fetchUser(userID);
                } catch {
                    userID = 'err';
                }
                if (userID == 'err') {
                    message.channel.send({
                        embed: {
                            color: config.color_warning,
                            title: 'USER NOT FOUND',
                            description: 'The provided user could not be found.\n Please ensure you have the correct ID/name.\n Usernames/nicknames are case sensitive.\n If the member is not in the guild, an ID is required.',
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                    return;
                }
                var userObject = guild.member(globalUser);

                if (userObject) {
                    var nickname;
                    var voiceChannel;
                    var app;

                    if (userObject.nickname) {
                        nickname = userObject.nickname;
                    } else {
                        nickname = 'No nickname';
                    }
                    if (userObject.voiceChannel) {
                        voiceChannel = userObject.voiceChannel.name;
                    } else {
                        voiceChannel = 'Not in a voice channel';
                    }
                    if (userObject.user.presence.game) {
                        app = userObject.user.presence.game.name;
                    } else {
                        app = 'None';
                    }

                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${userObject.user.username} (${nickname})`,
                                icon_url: userObject.user.displayAvatarURL
                            },
                            description: `${userObject.user} joined the guild on ${userObject.joinedAt}`,
                            thumbnail: {
                                url: userObject.user.displayAvatarURL
                            },
                            fields: [{
                                    name: 'Created',
                                    value: userObject.user.createdAt
                                },
                                {
                                    name: 'Status',
                                    value: `${userObject.user.presence.status.toUpperCase()}`,
                                    inline: true
                                },
                                {
                                    name: 'Application',
                                    value: `${app}`,
                                    inline: true
                                },
                                {
                                    name: 'Voice channel',
                                    value: `${voiceChannel}`
                                }
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).then(async msg => {
                        await msg.react('👥');
                        await msg.react('👮');
                        await msg.react('🔈');
                        await msg.react('✍');
                        await msg.react('📥');
                        await msg.react('❌');

                        const filter = (reaction, user) => user.bot == false;
                        const collector = msg.createReactionCollector(filter);

                        collector.on('collect', async r => {
                            if (r.emoji.name == '👮') {
                                await r.remove(r.users.last());

                                connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                    SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                    SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var events = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            if (row.type == 'warn') {
                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else if (row.type == 'ban') {
                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else {
                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                            }
                                            if (i == max - 1 && extra > 0) {
                                                events.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(events)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `Warnings for ${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: events.join(`\n`),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: userObject.user.username,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: `There are no recorded warnings for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '🔈') {
                                await r.remove(r.users.last());

                                connection.query('SELECT * FROM log_mutes WHERE userID = ? AND isDeleted = 0 ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var mutes = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            await mutes.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                            if (i == max - 1 && extra > 0) {
                                                mutes.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(mutes)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `Mutes for ${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: mutes.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: userObject.user.username,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: `There are no recorded mutes for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '❌') {
                                msg.delete();
                                message.delete();
                            } else if (r.emoji.name == '✍') {
                                await r.remove(r.users.last());
                                connection.query('SELECT * from log_note WHERE userID = ? and isDeleted = 0 ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var notes = [];
                                        for (var i = 0; i < rows.length; i++) {
                                            var row = rows[i];
                                            await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`);
                                        }
                                        if (!_.isEmpty(notes)) {
                                            msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: notes.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: `There are no recorded notes for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '👥') {
                                await r.remove(r.users.last());
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${userObject.joinedAt}`,
                                        thumbnail: {
                                            url: userObject.user.displayAvatarURL
                                        },
                                        fields: [{
                                                name: 'Created',
                                                value: userObject.user
                                                    .createdAt
                                            },
                                            {
                                                name: 'Status',
                                                value: userObject.user.presence
                                                    .status,
                                                inline: true
                                            },
                                            {
                                                name: 'Application',
                                                value: `${app}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Voice channel',
                                                value: `${voiceChannel}`
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                });
                            } else if (r.emoji.name == '📥') {
                                await r.remove(r.users.last());
                                connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                    [userID, userID],
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var history = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            switch (row.Status) {
                                                case 'join':
                                                    history.push(`📥 ${userObject.user.username} joined at \`${new Date(row.timestamp)}\`\n\n`);
                                                    break;
                                                case 'leave':
                                                    history.push(`📤 ${userObject.user.username} left at \`${new Date(row.timestamp)}\`\n\n`);
                                                    break;
                                            }
                                            if (i == max - 1 && extra > 0) {
                                                history.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(history)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: history.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `Join/Leave history for ${userObject.user.username} (${nickname})`,
                                                        icon_url: userObject.user.displayAvatarURL
                                                    },
                                                    description: `There are no join/leave records for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else {
                                return;
                            }
                        });
                        //collector.on('end');
                    }).catch(console.error);
                } else if (globalUser) {
                    message.channel.send({
                        embed: {
                            color: config.color_caution,
                            author: {
                                name: globalUser.username,
                                icon_url: globalUser.displayAvatarURL
                            },
                            title: `${userID}`,
                            description: `The user you provided is not currently camping in this guild.`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).then(async msg => {
                        await msg.react('👥');
                        await msg.react('👮');
                        await msg.react('🔈');
                        await msg.react('✍');
                        await msg.react('📥');
                        await msg.react('❌');

                        const filter = (reaction, user) => user.bot == false;
                        const collector = msg.createReactionCollector(filter);

                        collector.on('collect', async r => {
                            if (r.emoji.name == '👮') {
                                await r.remove(r.users.last());

                                connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                    SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                    SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var events = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            if (row.type == 'warn') {
                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`
                                                );
                                            } else if (row.type == 'ban') {
                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else {
                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                            }
                                            if (i == max - 1 && extra > 0) {
                                                events.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(events)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `Warnings for ${globalUser.username}`,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: events.join(`\n`),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: globalUser.username,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: `There are no recorded warnings for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '🔈') {
                                await r.remove(r.users.last());

                                connection.query('SELECT * FROM log_mutes WHERE userID = ? AND isDeleted = 0 ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var mutes = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            await mutes.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                            if (i == max - 1 && extra > 0) {
                                                mutes.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(mutes)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `Mutes for ${globalUser.username}`,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: mutes.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: globalUser.username,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: `There are no recorded mutes for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '❌') {
                                msg.delete();
                                message.delete();
                            } else if (r.emoji.name == '✍') {
                                await r.remove(r.users.last());
                                connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var notes = [];
                                        for (var i = 0; i < rows.length; i++) {
                                            var row = rows[i];
                                            await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`);
                                        }
                                        if (!_.isEmpty(notes)) {
                                            msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: globalUser.username,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: notes.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: globalUser.username,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: `There are no recorded notes for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '👥') {
                                await r.remove(r.users.last());
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        title: `${userID}`,
                                        description: `The user you provided is not currently camping in this guild.`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                });
                            } else if (r.emoji.name == '📥') {
                                await r.remove(r.users.last());
                                connection.query(`SELETC Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                    [userID, userID],
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        var history = [];
                                        var max = 5;
                                        var extra;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (var i = 0; i < max; i++) {
                                            var row = rows[i];
                                            switch (row.Status) {
                                                case 'join':
                                                    history.push(`📥 ${globalUser.username} joined at \`${new Date(row.timestamp)}\`\n\n`);
                                                    break;
                                                case 'leave':
                                                    history.push(`📤 ${globalUser.username} left at \`${new Date(row.timestamp)}\`\n\n`
                                                    );
                                                    break;
                                            }
                                            if (i == max - 1 && extra > 0) {
                                                history.push(`...${extra} more`);
                                            }
                                        }
                                        if (!_.isEmpty(history)) {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: `Join/Leave history for ${globalUser.username}`,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: history.join(' '),
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        } else {
                                            await msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: globalUser.username,
                                                        icon_url: globalUser.displayAvatarURL
                                                    },
                                                    description: `There are no join/leave records for this user`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            });
                                        }
                                    }
                                );
                            } else {
                                return;
                            }
                        });
                        //collector.on('end');
                    }).catch(console.error);
                } else {
                    connection.query('SELECT * FROM users WHERE userid = ? ORDER BY updated DESC LIMIT 1', userID,
                        async function (err, rows, results) {
                            var cardUser = rows[0];
                            message.channel.send({
                                embed: {
                                    color: config.color_caution,
                                    author: {
                                        name: `${cardUser.username}`,
                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                    },
                                    title: `${userID}`,
                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).then(async msg => {
                                await msg.react('👥');
                                await msg.react('👮');
                                await msg.react('🔈');
                                await msg.react('✍');
                                await msg.react('📥');
                                await msg.react('❌');

                                const filter = (reaction, user) => user.bot == false;
                                const collector = msg.createReactionCollector(filter);

                                collector.on('collect', async r => {
                                    if (r.emoji.name == '👮') {
                                        await r.remove(r.users.last());

                                        connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted AND gub.actioner <> '001' = 0 UNION ALL
                                            SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                            SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                            async function (err, rows, results) {
                                                if (err) throw err;
                                                var events = [];
                                                var max = 5;
                                                var extra;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (var i = 0; i < max; i++) {
                                                    var row = rows[i];
                                                    if (row.type == 'warn') {
                                                        await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                                    } else if (row.type == 'ban') {
                                                        await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                                    } else {
                                                        await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n`);
                                                    }
                                                    if (i == max - 1 && extra > 0) {
                                                        events.push(`...${extra} more`);
                                                    }
                                                }
                                                if (!_.isEmpty(events)) {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_info,
                                                            author: {
                                                                name: `Warnings for ${cardUser.username}`,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: events.join(`\n`),
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_caution,
                                                            author: {
                                                                name: cardUser.username,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: `There are no recorded warnings for this user`,
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    } else if (r.emoji.name == '🔈') {
                                        await r.remove(r.users.last());

                                        connection.query('SELECT * FROM log_mutes WHERE userID = ? AND isDeleted = 0 ORDER BY timestamp DESC', userID,
                                            async function (err, rows, results) {
                                                if (err) throw err;
                                                var mutes = [];
                                                var max = 5;
                                                var extra;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (var i = 0; i < max; i++) {
                                                    var row = rows[i];
                                                    await mutes.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                    if (i == max - 1 && extra > 0) {
                                                        mutes.push(`...${extra} more`);
                                                    }
                                                }
                                                if (!_.isEmpty(mutes)) {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_info,
                                                            author: {
                                                                name: `Mutes for ${cardUser.username}`,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: mutes.join(' '),
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_caution,
                                                            author: {
                                                                name: cardUser.username,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: `There are no recorded mutes for this user`,
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    } else if (r.emoji.name == '❌') {
                                        msg.delete();
                                        message.delete();
                                    } else if (r.emoji.name == '✍') {
                                        await r.remove(r.users.last());
                                        connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 ORDER BY timestamp DESC', userID,
                                            async function (err, rows, results ) {
                                                if (err) throw err;
                                                var notes = [];
                                                for ( var i = 0; i < rows.length; i++ ) {
                                                    var row = rows[i];
                                                    await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`);
                                                }
                                                if (!_.isEmpty(notes)) {
                                                    msg.edit({
                                                        embed: {
                                                            color: config.color_info,
                                                            author: {
                                                                name: cardUser.username,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: notes.join(' '),
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    msg.edit({
                                                        embed: {
                                                            color: config.color_caution,
                                                            author: {
                                                                name: cardUser.username,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: `There are no recorded notes for this user`,
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    } else if (r.emoji.name == '👥') {
                                        await r.remove(r.users.last());
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: cardUser.username,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${userID}`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        });
                                    } else if (r.emoji.name == '📥') {
                                        await r.remove(r.users.last());
                                        connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                            [userID, userID],
                                            async function (err, rows, results) {
                                                if (err) throw err;
                                                var history = [];
                                                var max = 5;
                                                var extra;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra =
                                                        rows.length - max;
                                                }

                                                for (var i = 0; i < max; i++) {
                                                    var row = rows[i];
                                                    switch (row.Status) {
                                                        case 'join':
                                                            history.push(`📥 ${cardUser.username} joined at \`${new Date(row.timestamp)}\`\n\n`);
                                                            break;
                                                        case 'leave':
                                                            history.push(`📤 ${cardUser.username} left at \`${new Date(row.timestamp)}\`\n\n`);
                                                            break;
                                                    }
                                                    if (i == max - 1 && extra > 0) {
                                                        history.push(`...${extra} more`);
                                                    }
                                                }
                                                if (!_.isEmpty(history)) {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_info,
                                                            author: {
                                                                name: `Join/Leave history for ${cardUser.username}`,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: history.join(' '),
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    await msg.edit({
                                                        embed: {
                                                            color: config.color_caution,
                                                            author: {
                                                                name: cardUser.username,
                                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                            },
                                                            description: `There are no join/leave records for this user`,
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        return;
                                    }
                                });
                                //collector.on('end');
                            }).catch(console.error);
                        }
                    );
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'warn') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_WARN')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    syntaxErr(message, 'warn');
                    return;
                }

                if (user == 'err') {
                    message.channel.send('An invalid user was provided. Please try again');
                } else {
                    if (guild.member(user)) {
                        var tail = args.slice(1);
                        var content = tail.join(' ').trim();

                        if (tail.length > 0) {
                            var identifier = cryptoRandomString({ length: 10 });
                            var data = [user, message.author.id, content, identifier, 0, new Date(), user /*SP arg*/];
                            connection.query('INSERT INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?); CALL user_totalRecords(?, @total) ', data,
                                function (err, results) {
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
                                            fields: [{
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

                                    client.users.get(user).createDM().then(async chnl => {
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
                                                            value: 'This warning can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
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
                                    }).catch(console.error);
                                }
                            );
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

    if (command === 'cwarn') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_CWARN')) {
                if (args[0].length == 10) {
                    connection.query('UPDATE log_warn SET isDeleted = 1 WHERE identifier = ?', args[0].trim(),
                        function (err, results, rows) {
                            if (err) throw err;
                            if (results.affectedRows == 1) {
                                message.channel.send( `☑ Warning with id \`${args[0].trim()}\` was successfully cleared.`);
                            } else {
                                message.channel.send(`A warning with that ID could not be found`) .then(msg => {
                                    setTimeout(async () => {
                                        await msg.delete();
                                        await message.delete();
                                    }, 6000);
                                }).catch(console.error);
                            }
                        }
                    );
                } else {
                    syntaxErr(message, 'cwarn');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'help') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            var staffHelpCommands =
            `[Commands in detail](https://github.com/FMWK/logbot/wiki/Commands-in-detail)

            **Fun commands:**
            ${config.prefix}flipacoin
            ${config.prefix}roll
            ${config.prefix}ask <query>

            **Utility commands:**
            ${config.prefix}module <module> <0/1>
            ${config.prefix}listmodules
            ${config.prefix}users count
            ${config.prefix}users update
            ${config.prefix}ban <user> <reason>
            ${config.prefix}unban <user> <reason>
            ${config.prefix}note <user> <note_content>
            ${config.prefix}cnote <identifier>
            ${config.prefix}warn <user> <reason>
            ${config.prefix}cwarn <identifier>
            ${config.prefix}user <user>
            ${config.prefix}helper clear <amount> <channel> <user>
            ${config.prefix}helper mute <user> <length> <reason>
            ${config.prefix}voicelog <user>
            ${config.prefix}vc <user>
            ${config.prefix}disconnect <user>
            ${config.prefix}badwords add <word/s>
            ${config.prefix}badwords remove <word/s>
            ${config.prefix}badwords clear
            ${config.prefix}badwords list
            ${config.prefix}mute <user> <length> <reason>
            ${config.prefix}unmute <user> <reason>
            ${config.prefix}remindme <length> <reminder>
            ${config.prefix}commands add <command> <content>
            ${config.prefix}commands remove <command>
            ${config.prefix}commands list
            ${config.prefix}lock
            ${config.prefix}unlock`;

            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: `**Listing all available commands:**`,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.displayAvatarURL
                    },
                    description: `${staffHelpCommands}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
            return;
        }
        if (message.member.roles.some(role => ['Support'].includes(role.name))) {
            var helperCommands =
                `**Fun commands:**
            **${config.prefix}flipacoin:** This command will flip a coin and return the result.
            **${config.prefix}roll:** This command will return a random number between 1 and 100.
            **${config.prefix}ask <query>:** This command will return an answer to the query.

            **Utility commands:**
            **${config.prefix}note <user> <note_content>:** This command is used to add notes to a user. When a note is added to a user, they are not notified.
            **${config.prefix}helper clear <amount> <channel> <user>:** This command is used to clear messages written by a user in the given channel.
            **${config.prefix}helper mute <user> <length> <reason>:** This command is used to mute a user for a given time period (maximum of 5 minutes).
            **${config.prefix}commands list:** This command lists all current custom commands.
            **${config.prefix}remindme <length> <reminder>:** This command is used to remind you of the note provided after the specified time has passed.

            Length formats (Case insensitive):
            \`1m\`
            \`1h\`
            \`1d\`
            \`1\` - If no suffix is given, default will be hours`;

            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: `**Listing all available commands:**`,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.displayAvatarURL
                    },
                    description: `${helperCommands}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
            return;
        }

        var helpCommands =
        `${config.prefix}bugreport
        ${config.prefix}forums
        ${config.prefix}invite
        ${config.prefix}official
        ${config.prefix}mobile
        ${config.prefix}lite
        ${config.prefix}report
        ${config.prefix}roc
        ${config.prefix}support
        ${config.prefix}wiki`;

        message.channel.send({
            embed: {
                color: config.color_info,
                title: `**Listing all available commands:**`,
                author: {
                    name: client.user.username,
                    icon_url: client.user.displayAvatarURL
                },
                description: `${helpCommands}`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        });
    }

    if (command === 'commands') {
        if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
                if (args[0].toLowerCase() === 'add') {
                    if (args[1]) {
                        var commandStr = _.rest(args, 2).join(' ');
                        customCommands.set(args[1] + '.content', commandStr);
                        customCommands.save();
                        message.channel.send(':white_check_mark: Command added successfully.');
                    } else syntaxErr(message, `commands_add`);
                }
                if (args[0].toLowerCase() === 'remove') {
                    if (args[1]) {
                        customCommands.unset(args[1]);
                        customCommands.save();
                        message.channel.send(':white_check_mark: Command removed successfully.');
                    } else syntaxErr(message, `commands_remove`);
                }
            }
            if (args[0].toLowerCase() === 'list') {
                var cKeys = _.keys(customCommands.read());
                var numberOfCommands = 0;
                var allCommands = '';
                var plural = 'commands';
                for (var i = 0; i < cKeys.length; i++) {
                    if (allCommands.length > 1900) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                title: `**Listing ${numberOfCommands} custom ${plural}:**`,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.displayAvatarURL
                                },
                                description: `${allCommands}`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                        allCommands = ``;
                        numberOfCommands = 0;
                    }
                    numberOfCommands++;
                    allCommands +=`\n **${cKeys[i]}:** ${customCommands.get(cKeys[i]).content}`;
                    if (numberOfCommands == 1) {
                        plural = 'command';
                    } else plural = 'commands';
                    if (i === (cKeys.length - 1)) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                title: `**Listing ${numberOfCommands} custom ${plural}:**`,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.displayAvatarURL
                                },
                                description: `${allCommands}`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    if (command === 'lfgrooms') {
        if (args[0].toLowerCase() === 'add') {
            let next = _.keys(LFGRoomsFile.read()).length + 1;
            LFGRoomsFile.set(args[1], next);
            LFGRoomsFile.save();

            message.channel.send(`Added \`${args[1]}\``);
        }
        if (args[0].toLowerCase() === 'remove') {
            LFGRoomsFile.unset(args[1]);
            LFGRoomsFile.save();

            message.channel.send(`Removed \`${args[1]}\``);
        }

        if (_.size(args) == 0) {
            var list = _.keys(LFGRoomsFile.read());

            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: 'List of LFG rooms',
                    description: `${list.join('\n')}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        }
    }

    if (command === 'lock') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
                var everyone = guild.roles.find( role => role.name === '@everyone');
                var channels = _.keys(LFGRoomsFile.read());
                for (var i = 0; i < channels.length; i++) {
                    var channelObj = guild.channels.find(obj => obj.name == channels[i]);
                    if (channelObj) {
                        if (channelObj.permissionsFor(everyone).has('SEND_MESSAGES')) {
                            await channelObj.overwritePermissions(everyone, {
                                        SEND_MESSAGES: false
                                    }, 'Servers are down for the update').then(channel => {
                                        channel.send({
                                            embed: {
                                                color: config.color_info,
                                                title: 'Maintenance has begun',
                                                description: 'Channel will be locked until maintenance ends. Keep an eye on <#289467450074988545> for more info.',
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        });
                                        message.channel.send(`Channel ${channel} successfully locked`);
                                    }
                                );
                        } else message.channel.send(`Channel ${channelObj} is already locked.`);
                    } else message.channel.send(`Channel ${channels[i]} could not be found/resolved.`);
                }
            } else message.channel.send(`That module (${command}) is disabled.`);
        }
    }

    if (command === 'unlock') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
                var everyone = guild.roles.find(role => role.name === '@everyone');
                var channels = _.keys(LFGRoomsFile.read());
                for (var i = 0; i < channels.length; i++) {
                    var channelObj = guild.channels.find(obj => obj.name == channels[i]);
                    if (channelObj) {
                        if (!channelObj.permissionsFor(everyone).has('SEND_MESSAGES')) {
                            await channelObj.overwritePermissions(everyone, {
                                        SEND_MESSAGES: null
                                    },'Servers are back up from the update').then(channel => {
                                        channel.send({
                                            embed: {
                                                color: config.color_info,
                                                title: 'Maintenance has ended',
                                                description: 'Channel is now unlocked.',
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        });
                                        message.channel.send(`Channel ${channel} successfully unlocked`);
                                    }
                                );
                        } else message.channel.send(`Channel ${channelObj} is not locked.`);
                    } else message.channel.send(`Channel ${channels[i]} could not be found/resolved.`);
                }
            } else message.channel.send(`That module (${command}) is disabled.`);
        }
    }

    if (command === 'helper') {
        if (args[0].toLowerCase() === 'clear') {
            if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
                if (modulesFile.get('COMMAND_HELPER_CLEAR')) {
                    if (args.length >= 4) {
                        var amount = args[1];
                        var channelid = parseChannelTag(args[2]);
                        var userid = parseUserTag(args[3]);

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
                                            }
                                        );
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
                        syntaxErr(message, 'helper_clear');
                    }
                } else {
                    message.channel.send(`That module (${command}) is disabled.`);
                }
            }
        }

        if (args[0].toLowerCase() === 'mute') {
            if (message.member.roles.some(role => ['Support'].includes(role.name))) {
                if (modulesFile.get('COMMAND_HELPER_MUTE')) {
                    var user = parseUserTag(args[1]);
                    var guildUser = guild.member(user);

                    if (user !== 'err' && guildUser) {
                        if (mutedFile.get(user)) {
                            var existingMute = mutedFile.get(user);
                            message.channel.send(`${client.users.get(user)} already has an active mute. This will end at ${new Date(existingMute.end * 1000)}`);
                        } else {
                            if (parseInt(args[2])) {
                                if (args[2] <= 5) {
                                    var end = Math.floor(Date.now() / 1000) + args[2] * 60;
                                    var seconds = args[2] * 60;

                                    var reason = _.rest(args, 3).join(' ');

                                    if (reason.length > 0) {
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
                                                    fields: [{
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
                                                }
                                            );

                                            member.createDM().then(async chnl => {
                                                await chnl.send({
                                                    embed: {
                                                        color: config.color_caution,
                                                        title: `You have been muted in ${guild.name}`,
                                                        description: `Details regarding the mute can be found below:`,
                                                        fields: [{
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
                                                        }
                                                    );
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
                } else {
                    message.channel.send(`That module (${command}) is disabled.`);
                }
            }
        }
    }

    if (command === 'voicelog') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_VOICELOG')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    syntaxErr(message, 'voicelog');
                    return;
                }

                if (user == 'err') {
                    message.channel.send('An invalid user was provided. Please try again');
                } else {
                    connection.query('SELECT * from log_voice WHERE userID = ? ORDER BY timestamp DESC LIMIT 22', user,
                        async function (err, rows, results) {
                            if (err) throw err;

                            var times = [];
                            var current = [];
                            var timestamps = [];
                            var msg = [
                                'Channel        |                     Timestamp                     | Duration (H:M:S)',
                                '------------------------------------------------------------------------------------------------'
                            ];
                            for (var i = rows.length - 1; i >= 0; i--) {
                                var row = rows[i];

                                if (rows[i - 1]) {
                                    //We have a next event
                                    var next = rows[i - 1];

                                    if (row.type !== 3 && [2, 3].indexOf(next.type) > -1) {
                                        //The current event IS NOT a leave event AND the next event IS a move or leave event. i.e, that's a complete wrap of one channel.
                                        var time1 = row.timestamp;
                                        var time2 = next.timestamp;

                                        var diff = time2.getTime() - time1.getTime();

                                        var msec = diff;
                                        var hh = Math.floor(msec / 1000 / 60 / 60);
                                        msec -= hh * 1000 * 60 * 60;
                                        var mm = Math.floor(msec / 1000 / 60);
                                        msec -= mm * 1000 * 60;
                                        var ss = Math.floor(msec / 1000);
                                        msec -= ss * 1000;

                                        times.push(`${hh}:${mm}:${ss}`);
                                        current.push(row.newChannel);
                                        timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                    }
                                } else if (!rows[i - 1] && [1, 2].indexOf(row.type) > -1) {
                                    //No next event available AND current event is a fresh join or move. i.e, we can assume they are still here.
                                    current.push(row.newChannel);
                                    times.push('Active');
                                    timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                }
                            }
                            times.reverse();
                            current.reverse();
                            timestamps.reverse();

                            var longest = 0;
                            for (var i = 0; i < current.length; i++) {
                                if (current[i].length > longest) {
                                    longest = current[i].length;
                                }
                            }
                            for (var j = 0; j < current.length; j++) {
                                var howManyToAdd = longest - current[j].length;
                                current[j] = current[j].padEnd(current[j].length + howManyToAdd + 1);
                            }

                            var longestTime = 0;
                            for (var i = 0; i < timestamps.length; i++) {
                                if (current[i].length > longestTime) {
                                    longestTime = timestamps[i].length;
                                }
                            }
                            for (var j = 0; j < timestamps.length; j++) {
                                var howManyToAdd = longestTime - timestamps[j].length;
                                timestamps[j] = timestamps[j].padEnd(timestamps[j].length + howManyToAdd + 1);
                            }

                            for (var i = 0; i < times.length; i++) {
                                msg.push(`${current[i]}|     ${timestamps[i]}     | ${times[i]}`);
                            }
                            var joinedMessage = msg.join('\n');
                            message.channel.send(`🎙 Viewing the voice logs of ${client.users.get(user)} \`\`\`${joinedMessage}\`\`\``);
                        }
                    );
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'disconnect') {
        if (message.member.roles.some(role => ['Admins', 'Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_DISCONNECT')) {
                var user = parseUserTag(args[0]);
                var guildUser = guild.member(user);

                if (user !== 'err' && guildUser && guildUser.voiceChannel !== undefined) {
                    guildUser.setVoiceChannel(null).then(member => {
                        message.channel.send(`${member} was successfully removed from their voice channel.`);
                        }).catch(console.error);
                } else {
                    message.channel.send('The user provided was not found or is not in a voice channel.');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'badwords') {
        if (args[0].toLowerCase() === 'add') {
            if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
                if (args[1]) {
                    var newWords = args.splice(1);
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < newWords.length; j++) {
                            if (i != j && newWords[i] == newWords[j]) {
                                message.channel.send(`:x: The argument contains duplicates.`);
                                return;
                            }
                        }
                    }
                    var currentWords = badWordsFile.get(`badWords`);
                    if (currentWords.length > 0) {
                        if (currentWords.some(word => newWords.includes(word))) {
                            message.channel.send(`:x: One or more words are already on the list.`);
                            return;
                        }
                    }
                    currentWords = currentWords.concat(newWords);
                    badWordsFile.set(`badWords`, currentWords);
                    badWordsFile.save();
                    message.channel.send(`:white_check_mark: Word(s) \`${newWords}\` added successfully.`);
                } else {
                    message.channel.send(`Please specify a word or words to add.`).then(msg => {
                        setTimeout(async () => {
                            await message.delete();
                            await msg.delete();
                        }, 7000);
                    }).catch(console.error);
                }
            }
        }
        if (args[0].toLowerCase() === 'remove') {
            if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
                if (args[1]) {
                    var newWords = args.splice(1);
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < newWords.length; j++) {
                            if (i != j && newWords[i] == newWords[j]) {
                                message.channel.send(`:x: The argument contains duplicates.`);
                                return;
                            }
                        }
                    }
                    var currentWords = badWordsFile.get(`badWords`);
                    var numberOfElements = 0;
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < currentWords.length; j++) {
                            if (newWords[i] === currentWords[j]) {
                                numberOfElements++;
                            }
                        }
                    }
                    if (numberOfElements < newWords.length) {
                        message.channel.send(`:x: One or more words are not on the list.`);
                        return;
                    }
                    for (var i = 0; i < currentWords.length; i++) {
                        for (var j = 0; j < newWords.length; j++) {
                            if (currentWords[i] === newWords[j]) {
                                currentWords = currentWords.splice(i, 1);
                            }
                        }
                    }
                    badWordsFile.save();
                    message.channel.send(`:white_check_mark: All words \`${newWords}\` removed successfully.`);
                } else {
                    message.channel.send(`Please specify a word or words to remove.`).then(msg => {
                        setTimeout(async () => {
                            await message.delete();
                            await msg.delete();
                        }, 7000);
                    }).catch(console.error);
                }
            }
        }
        if (args[0].toLowerCase() === 'clear') {
            if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
                if (badWordsFile.get(`badWords`).length > 0) {
                    badWordsFile.unset(`badWords`);
                    badWordsFile.set(`badWords`, []);
                    badWordsFile.save();
                    message.channel.send(`:white_check_mark: All bad words successfully removed.`);
                } else message.channel.send(`:x: No bad words could be found.`);
            }
        }
        if (args[0].toLowerCase() === 'list') {
            if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
                var currentWords = badWordsFile.get(`badWords`).join(`\n`);
                if (currentWords) {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: `Current bad words:`,
                            description: `${currentWords}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                } else {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: `Current bad words:`,
                            description: `No bad words could be found.`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version }`
                            }
                        }
                    });
                }
            }
        }
    }

    if (command === 'mute') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_MUTE')) {
                var user = parseUserTag(args[0]);
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
                            switch (args[1].toLowerCase().charAt(args[1].length - 1)) {
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

                                guild.member(user).addRole(mutedRole).then(member => {
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
                                                    fields: [{
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
                                        }
                                    );

                                    member.createDM().then(async chnl => {
                                        await chnl.send({
                                            embed: {
                                                color: config.color_caution,
                                                title: `You have been muted in ${guild.name}`,
                                                description: `Details regarding the mute can be found below:`,
                                                fields: [{
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
                                    }).catch(console.error);
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
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'unmute') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_UNMUTE')) {
            var user = parseUserTag(args[0]);
            var guildUser = guild.member(user);

            if (user !== 'err' && guildUser) {
            if ((mutedFile.get(user)) || (guild.members.get(user).roles.some(r => r.name === 'Muted'))) {
                var reason = _.rest(args, 1).join(' ');

                if (reason.length > 0) {

                mutedFile.unset(`${user}`);
                mutedFile.save();

                var mutedRole = guild.roles.find(val => val.name === 'Muted');
                var identifier = cryptoRandomString({ length: 10 });

                guild.member(user).removeRole(mutedRole).then(member => {
                    var data = [user, message.author.id, reason, identifier, 0, new Date(), user /*SP arg*/];
                    connection.query('INSERT INTO log_unmutes(userID, actioner, description, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?);',
                    data, function (err, results) {
                    if (err) throw err;
                    message.channel.send({embed: {
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
                    });
                    });
                member.createDM().then(async chnl => {
                    await chnl.send({
                    embed: {
                        color: config.color_info,
                        title: `You have been unmuted in ${guild.name}`,
                        description: `Details regarding the mute can be found below:`,
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
                        var data = [user, dm.embeds[0].title, 3, 0, identifier, new Date(), new Date()];
                    } else {
                        var data = [user, dm.content, 3, 0, identifier, new Date(), new Date()];
                    }
                    connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data, function (err, results) {
                        if (err) throw err;
                    });
                    });
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
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
    }

    if (command === 'remindme') {
        if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            if (modulesFile.get('COMMAND_REMINDME')) {
                var user = message.author.id;
                var end;
                var int = args[0].replace(/[a-zA-Z]$/g, '');
                if (parseInt(int)) {
                    switch (args[0].toLowerCase().charAt(args[0].length - 1)) {
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

                    var reminder = _.rest(args, 1).join(' ');

                    if (reminder.length > 0) {
                        reminderFile.set(`${user}${end}.who`, message.author.id);
                        reminderFile.set(`${user}${end}.end`, end);
                        reminderFile.set(`${user}${end}.reminder`, reminder);
                        reminderFile.set(`${user}${end}.length`, args[0]);
                        reminderFile.save();

                        message.channel.send({
                            embed: {
                                color: config.color_success,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.displayAvatarURL
                                },
                                title: `Reminder Set`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    } else {
                        message.channel.send('Please provide a reminder note.');
                    }
                }
            }
        }
    }

    if (command === 'vc') {
        if (message.member.roles.some(role => role.name === 'Moderators')) {
            if (modulesFile.get('COMMAND_VC')) {
                var user = parseUserTag(args[0]);
                var guildUser = message.guild.member(user);
                if (user !== 'err' && guildUser) {
                    var vc = guildUser.voiceChannel;
                    if (vc != undefined) {
                        switch (vc.members.size) {
                            case 1:
                                message.channel.send(`User ${guildUser} is in voice channel **${vc.name}**`);
                                break;
                            default:
                                message.channel.send(`User ${guildUser} is in voice channel **${vc.name}** with ${vc.members.size - 1} other users`);
                        }
                    } else message.channel.send(`User ${guildUser} is not in a voice channel`);
                } else message.channel.send('Thes user provided was not found');
            }
        }
    }

    if (command === 'status') {
        if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            var client_PING = Math.floor(client.ping);
            var db_PING = connection.ping();

            var client_STATUS;
            var db_STATUS;

            if (client_PING >= 1 && client_PING <= 500) {
                client_STATUS = 'OK';
            } else if (client_PING > 500 && client_PING <= 5000) {
                client_STATUS = 'Degraded';
            } else {
                client_STATUS = 'Severely Degraded or Error';
            }

            if (db_PING) {
                db_STATUS = 'OK';
            } else {
                db_STATUS = 'Severely Degraded or Error';
            }

            message.channel.send({
                embed: {
                    color: config.color_info,
                    description: `**Client -** ${client_STATUS} (${client_PING}ms)\n **Database -** ${db_STATUS}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        }
    }
}