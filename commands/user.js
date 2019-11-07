exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const config = client.config;
    const connection = client.connection;
    const _ = client.underscore;
    const guild = message.guild;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_USER')) {
            if (args) var userID = functionsFile.parseUserTag(client, message.guild, args.join(' '));
            else {
                functionsFile.syntaxErr(client, message, 'user');
                return;
            }
            var globalUser;
            try {
                globalUser = await client.fetchUser(userID);
            } catch (e) {
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
                        description: `${userObject.user} joined the guild on ${userObject.joinedAt.toUTCString()}`,
                        thumbnail: {
                            url: userObject.user.displayAvatarURL
                        },
                        fields: [
                            {
                                name: 'Created',
                                value: userObject.user.createdAt.toUTCString()
                            },
                            {
                                name: 'ID',
                                value: userObject.user.id,
                                inline: true
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
                                value: `${voiceChannel}`,
                                inline: true
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).then(async msg => {

                    const filter = (reaction, user) => !user.bot;
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
                                            await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                        } else if (row.type == 'ban') {
                                            await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                        } else {
                                            await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                        }).catch(console.error);
                                    } else {
                                        await msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${userObject.user.username} (${nickname})`,
                                                    icon_url: userObject.user.displayAvatarURL
                                                },
                                                description: `There are no recorded warnings for this user`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    }
                                }
                            );
                        } else if (r.emoji.name == '🔈') {
                            await r.remove(r.users.last());

                            connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                            SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                            gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
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
                                    switch(row.type) {
                                        case 'mute':
                                            await events.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                            break;
                                        case 'unmute':
                                            await events.push(`\`${row.identifier}\` 🔊 Unmute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                            break;
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
                                                name: `Mutes for ${userObject.user.username} (${nickname})`,
                                                icon_url: userObject.user.displayAvatarURL
                                            },
                                            description: events.join(' '),
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `${userObject.user.username} (${nickname})`,
                                                icon_url: userObject.user.displayAvatarURL
                                            },
                                            description: `There are no recorded mutes for this user`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                            });
                        } else if (r.emoji.name == '❌') {
                            msg.delete();
                            message.delete();
                        } else if (r.emoji.name == '✍') {
                            await r.remove(r.users.last());
                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                async function (err, rows, results) {
                                    if (err) throw err;
                                    var notes = [];
                                    
                                    var max = 5;
                                    var extra;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (var i = 0; i < max; i++) {
                                        var row = rows[i];
                                        await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                        if (i == max - 1 && extra > 0) {
                                            notes.push(`...${extra} more`);
                                        }
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
                                        }).catch(console.error);
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
                                        }).catch(console.error);
                                    }
                                }
                            );
                        } else if (r.emoji.name == '🖥') {
                            await r.remove(r.users.last());
                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) throw err;
                                var notes = [];

                                var max = 5;
                                var extra;

                                if (rows.length <= max) {
                                    max = rows.length;
                                } else {
                                    extra = rows.length - max;
                                }

                                for (var i = 0; i < max; i++) {
                                    var row = rows[i];
                                    await notes.push(`\`${row.identifier}\` 🖥 SYSTEM NOTE on ${row.timestamp.toUTCString()} \n \`\`\`${row.description.replace(/`/g, '')}\`\`\`\n\n`);
                                    if (i == max - 1 && extra > 0) {
                                        notes.push(`...${extra} more`);
                                    }
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
                                    }).catch(console.error);
                                } else {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `${userObject.user.username} (${nickname})`,
                                                icon_url: userObject.user.displayAvatarURL
                                            },
                                            description: `There are no recorded system notes for this user`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                            });
                        } else if (r.emoji.name == '👥') {
                            await r.remove(r.users.last());
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
                            msg.edit({
                                embed: {
                                    color: config.color_info,
                                    author: {
                                        name: `${userObject.user.username} (${nickname})`,
                                        icon_url: userObject.user.displayAvatarURL
                                    },
                                    description: `${userObject.user} joined the guild on ${userObject.joinedAt.toUTCString()}`,
                                    thumbnail: {
                                        url: userObject.user.displayAvatarURL
                                    },
                                    fields: [
                                        {
                                            name: 'Created',
                                            value: userObject.user.createdAt.toUTCString()
                                        },
                                        {
                                            name: 'ID',
                                            value: userObject.user.id,
                                            inline: true
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
                                            value: `${voiceChannel}`,
                                            inline: true
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
                        } else if (r.emoji.name == '📛') {
                            await r.remove(r.users.last());
                            connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                            SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) throw err;
                                var names = [];
                                var max = 0;
                                var extra;

                                if (rows.length <= 5) {
                                    max = rows.length;
                                } else {
                                    extra = rows.length - max;
                                }

                                for (var i = 0; i < max; i++) {
                                    var row = rows[i];
                                    switch(row.type) {
                                        case 'user':
                                            names.push(`📛${userObject.user.username} changed username from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                        case 'nick':
                                            names.push(`${userObject.user.username} changed nickname from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                    }
                                    if (i == max - 1 && extra > 0) {
                                        names.push(`...${extra} more`);
                                    }
                                }

                                if (!_.isEmpty(names)) {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_info,
                                            author: {
                                                name: `${userObject.user.username} (${nickname})`,
                                                icon_url: userObject.user.displayAvatarURL
                                            },
                                            description: names.join(' '),
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `Name history for ${userObject.user.username} (${nickname})`,
                                                icon_url: userObject.user.displayAvatarURL
                                            },
                                            description: `There are no recorded name changes for this user`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                            });
                        } else if (r.emoji.name == '📥') {
                            await r.remove(r.users.last());
                            connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
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
                                            history.push(`📥 ${userObject.user.username} joined at \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                        case 'leave':
                                            history.push(`📤 ${userObject.user.username} left at \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
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
                                    }).catch(console.error);
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
                                    }).catch(console.error);
                                }
                            });
                        } else {
                            return;
                        }
                    });
                    await msg.react('👥');
                    await msg.react('👮');
                    await msg.react('🔈');
                    await msg.react('✍');
                    await msg.react('🖥');
                    await msg.react('📛');
                    await msg.react('📥');
                    await msg.react('❌');
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
                        title: `${globalUser.username}#${globalUser.discriminator}`,
                        description: `The user you provided is not currently camping in this guild.`,
                        fields: [
                            {
                                name: 'Created',
                                value: globalUser.createdAt.toUTCString(),
                                inline: true
                            },
                            {
                                name: 'ID',
                                value: globalUser.id,
                                inline: true
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).then(async msg => {

                    const filter = (reaction, user) => !user.bot;
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
                                            await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`
                                            );
                                        } else if (row.type == 'ban') {
                                            await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                        } else {
                                            await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                        }).catch(console.error);
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
                                        }).catch(console.error);
                                    }
                                }
                            );
                        } else if (r.emoji.name == '🔈') {
                            await r.remove(r.users.last());

                            connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                            SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                            gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
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
                                    switch(row.type) {
                                        case 'mute':
                                            await events.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                            break;
                                        case 'unmute':
                                            await events.push(`\`${row.identifier}\` 🔊 Unmute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                            break;
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
                                                name: `Mutes for ${globalUser.username}`,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            description: events.join(' '),
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
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
                                    }).catch(console.error);
                                }
                            });
                        } else if (r.emoji.name == '❌') {
                            msg.delete();
                            message.delete();
                        } else if (r.emoji.name == '✍') {
                            await r.remove(r.users.last());
                            connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) throw err;
                                var notes = [];

                                var max = 5;
                                var extra;

                                if (rows.length <= max) {
                                    max = rows.length;
                                } else {
                                    extra = rows.length - max;
                                }

                                for (var i = 0; i < max; i++) {
                                    var row = rows[i];
                                    await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                    if (i == max - 1 && extra > 0) {
                                        notes.push(`...${extra} more`);
                                    }
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
                                    }).catch(console.error);
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
                                    }).catch(console.error);
                                }
                            });
                        } else if (r.emoji.name == '🖥') {
                            await r.remove(r.users.last());
                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) throw err;
                                var notes = [];
                                var max = 5;
                                var extra;

                                if (rows.length <= max) {
                                    max = rows.length;
                                } else {
                                    extra = rows.length - max;
                                }

                                for (var i = 0; i < max; i++) {
                                    var row = rows[i];
                                    await notes.push(`\`${row.identifier}\` 🖥 SYSTEM NOTE on ${row.timestamp.toUTCString()} \n \`\`\`\n${row.description.replace(/`/g, '')}\n\`\`\`\n\n`);
                                    if (i == max - 1 && extra > 0) {
                                        notes.push(`...${extra} more`);
                                    }
                                }
                                if (!_.isEmpty(notes)) {
                                    msg.edit({
                                        embed: {
                                            color: config.color_info,
                                            author: {
                                                name: `${globalUser.username}`,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            description: notes.join(' '),
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `${globalUser.username}`,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            description: `There are no recorded system notes for this user`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                            });
                        }  else if (r.emoji.name == '📛') {
                            await r.remove(r.users.last());
                            connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                            SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) throw err;
                                var names = [];
                                var max = 0;
                                var extra;

                                if (rows.length <= 5) {
                                    max = rows.length;
                                } else {
                                    extra = rows.length - max;
                                }

                                for (var i = 0; i < max; i++) {
                                    var row = rows[i];
                                    switch(row.type) {
                                        case 'user':
                                            names.push(`📛${globalUser.username} changed username from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                        case 'nick':
                                            names.push(`${globalUser.username} changed nickname from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                    }
                                    if (i == max - 1 && extra > 0) {
                                        names.push(`...${extra} more`);
                                    }
                                }

                                if (!_.isEmpty(names)) {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_info,
                                            author: {
                                                name: `${globalUser.username}`,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            description: names.join(' '),
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else {
                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `Name history for ${globalUser.username}`,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            description: `There are no recorded name changes for this user`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                            });
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
                            }).catch(console.error);
                        } else if (r.emoji.name == '📥') {
                            await r.remove(r.users.last());
                            connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
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
                                            history.push(`📥 ${globalUser.username} joined at \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                            break;
                                        case 'leave':
                                            history.push(`📤 ${globalUser.username} left at \`${new Date(row.timestamp).toUTCString()}\`\n\n`
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
                                    }).catch(console.error);
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
                                    }).catch(console.error);
                                }
                            });
                        } else {
                            return;
                        }
                    });
                    await msg.react('👥');
                    await msg.react('👮');
                    await msg.react('🔈');
                    await msg.react('✍');
                    await msg.react('🖥');
                    await msg.react('📛');
                    await msg.react('📥');
                    await msg.react('❌');
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

                        const filter = (reaction, user) => !user.bot;
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
                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else if (row.type == 'ban') {
                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else {
                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                            }).catch(console.error);
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
                                            }).catch(console.error);
                                        }
                                    }
                                );
                            } else if (r.emoji.name == '🔈') {
                                await r.remove(r.users.last());

                                connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
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
                                        switch(row.type) {
                                            case 'mute':
                                                await events.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                break;
                                            case 'unmute':
                                                await events.push(`\`${row.identifier}\` 🔊 Unmute by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                                break;
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
                                                    name: `Mutes for ${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                description: events.join(' '),
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
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
                                        }).catch(console.error);
                                    }
                                });
                            } else if (r.emoji.name == '❌') {
                                msg.delete();
                                message.delete();
                            } else if (r.emoji.name == '✍') {
                                await r.remove(r.users.last());
                                connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                async function (err, rows, results ) {
                                    if (err) throw err;
                                    var notes = [];

                                    var max = 5;
                                    var extra;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for ( var i = 0; i < max; i++ ) {
                                        var row = rows[i];
                                        await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
                                        if (i == max - 1 && extra > 0) {
                                            notes.push(`...${extra} more`);
                                        }
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
                                        }).catch(console.error);
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
                                        }).catch(console.error);
                                    }
                                });
                            } else if (r.emoji.name == '🖥') {
                                await r.remove(r.users.last());
                                connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                async function (err, rows, results) {
                                    if (err) throw err;
                                    var notes = [];

                                    var max = 5;
                                    var extra;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (var i = 0; i < max; i++) {
                                        var row = rows[i];
                                        await notes.push(`\`${row.identifier}\` 🖥 SYSTEM NOTE on ${row.timestamp.toUTCString()} \n \`\`\`${row.description.replace(/`/g, '')}\`\`\`\n\n`);
                                        if (i == max - 1 && extra > 0) {
                                            notes.push(`...${extra} more`);
                                        }
                                    }
                                    if (!_.isEmpty(notes)) {
                                        msg.edit({
                                            embed: {
                                                color: config.color_info,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                description: notes.join(' '),
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    } else {
                                        await msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                description: `There are no recorded system notes for this user`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    }
                                });
                            }  else if (r.emoji.name == '📛') {
                                await r.remove(r.users.last());
                                connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                [userID, userID], async function (err, rows, results) {
                                    if (err) throw err;
                                    var names = [];
                                    var max = 0;
                                    var extra;

                                    if (rows.length <= 5) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (var i = 0; i < max; i++) {
                                        var row = rows[i];
                                        switch(row.type) {
                                            case 'user':
                                                names.push(`📛${cardUser.username} changed username from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                                break;
                                            case 'nick':
                                                names.push(`${cardUser.username} changed nickname from \`${row.old}\` to \`${row.new}\` on \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                                break;
                                        }
                                        if (i == max - 1 && extra > 0) {
                                            names.push(`...${extra} more`);
                                        }
                                    }
                                    if (!_.isEmpty(names)) {
                                        await msg.edit({
                                            embed: {
                                                color: config.color_info,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                description: names.join(' '),
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    } else {
                                        await msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `Name history for ${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                description: `There are no recorded name changes for this user`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    }
                                });
                            }  else if (r.emoji.name == '👥') {
                                await r.remove(r.users.last());
                                await msg.edit({
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
                                }).catch(console.error);
                            } else if (r.emoji.name == '📥') {
                                await r.remove(r.users.last());
                                connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                [userID, userID], async function (err, rows, results) {
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
                                                history.push(`📥 ${cardUser.username} joined at \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
                                                break;
                                            case 'leave':
                                                history.push(`📤 ${cardUser.username} left at \`${new Date(row.timestamp).toUTCString()}\`\n\n`);
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
                                        }).catch(console.error);
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
                                }).catch(console.error);
                            } else {
                                return;
                            }
                        });
                        await msg.react('👥');
                        await msg.react('👮');
                        await msg.react('🔈');
                        await msg.react('✍');
                        await msg.react('🖥');
                        await msg.react('📛');
                        await msg.react('📥');
                        await msg.react('❌');
                        //collector.on('end');
                    }).catch(console.error);
                });
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}
