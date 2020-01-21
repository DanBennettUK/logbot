exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const config = client.config;
    let connection = client.connection;
    const _ = client.underscore;
    let guild = message.guild;

    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_USER')) {
            let userID = '';
            const tag = args.join(' ');
            if (args.length > 0) userID = functionsFile.parseUserTag(client, guild, tag);
            else {
                functionsFile.syntaxErr(client, message, 'user');
                return;
            }
            if (userID == 'err') {
                const IDArray = await functionsFile.parseBannedUserTag(client, guild, tag);
                if (IDArray.length > 0) userID = IDArray[0];
                if (IDArray.length > 1) message.channel.send(`Multiple matching users have been found. The first will be displayed. All IDs of matching users are displayed below:\n${IDArray.join(' ')}`).catch(console.error);
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
            let globalUser = client.users.get(userID);
            if (!globalUser) {
                try {
                    globalUser = await client.fetchUser(userID);
                } catch (e) {
                    console.log(e);
                }
            }
            let userObject = guild.member(globalUser);
            let autoClose = null;
            if (userObject && userObject != null) {
                let nickname = 'No nickname';
                let voiceChannel = 'Not in a voice channel';
                let app = 'None';
                let joined = 'UNKNOWN';

                if (userObject.nickname) {
                    nickname = userObject.nickname;
                }
                if (userObject.voiceChannel) {
                    voiceChannel = userObject.voiceChannel.name;
                }
                if (userObject.user.presence.game) {
                    app = userObject.user.presence.game.name;
                    if (app == 'Custom Status') app += `:\n${userObject.user.presence.game.state}`;
                }
                if (userObject.joinedAt) {
                    joined = userObject.joinedAt.toUTCString();
                }

                message.channel.send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${userObject.user.username} (${nickname})`,
                            icon_url: userObject.user.displayAvatarURL
                        },
                        description: `${userObject.user} joined the guild on ${joined}`,
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

                    let filter = (reaction, user) => !user.bot;
                    let collector = msg.createReactionCollector(filter);

                    autoClose = setTimeout(() => {
                        collector.stop();
                        msg.clearReactions();
                        msg.edit({
                            embed: {
                                color: config.color_info,
                                author: {
                                    name: `${userObject.user.username} (${nickname})`,
                                    icon_url: userObject.user.displayAvatarURL
                                },
                                description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                    },
                                    {
                                        name: '**USERCARD CLOSED**',
                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                        userObject = null;
                        globalUser = null;
                        collector = null;
                        filter = null;
                        msg = null;
                        guild = null;
                        connection = null;
                    }, 300000);

                    collector.on('collect', async r => {
                        if (r.emoji.name == '👮') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                userObject = null;
                                globalUser = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                async function (err, rows, results) {
                                    if (err) {
                                        connection = functionsFile.establishConnection(client);
                                        connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                        SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                        SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            let events = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
                                                let actioner = client.users.get(row.actioner);
                                                if (!actioner) {
                                                    try {
                                                        actioner = await client.fetchUser(row.actioner);
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                                if (row.type == 'warn') {
                                                    await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                } else if (row.type == 'ban') {
                                                    await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                } else {
                                                    await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                        });
                                    } else {
                                        let events = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            if (row.type == 'warn') {
                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else if (row.type == 'ban') {
                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else {
                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                }
                            );
                        } else if (r.emoji.name == '🔈') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                            SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                            gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                            async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                    SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                    gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        let events = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            switch (row.type) {
                                                case 'mute':
                                                    await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                    break;
                                                case 'unmute':
                                                    await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                } else {
                                    let events = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
                                        let actioner = client.users.get(row.actioner);
                                        if (!actioner) {
                                            try {
                                                actioner = await client.fetchUser(row.actioner);
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                        switch (row.type) {
                                            case 'mute':
                                                await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                break;
                                            case 'unmute':
                                                await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                }
                            });
                        } else if (r.emoji.name == '❌') {
                            clearTimeout(autoClose);
                            collector.stop();
                            msg.delete().catch(console.error);
                            message.delete().catch(console.error);
                            collector = null;
                            filter = null;
                            msg = null;
                            guild = null;
                            userObject = null;
                            globalUser = null;
                            connection = null;
                        } else if (r.emoji.name == '✍') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                async function (err, rows, results) {
                                    if (err) {
                                        connection = functionsFile.establishConnection(client);
                                        connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            let notes = [];

                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
                                                let actioner = client.users.get(row.actioner);
                                                if (!actioner) {
                                                    try {
                                                        actioner = await client.fetchUser(row.actioner);
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                                await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                        });
                                    } else {
                                        let notes = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                }
                            );
                        } else if (r.emoji.name == '🖥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        let notes = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
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
                                } else {
                                    let notes = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
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
                                }
                            });
                        } else if (r.emoji.name == '👥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

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
                                    description: `${userObject.user} joined the guild on ${joined}`,
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
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                            SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                    SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) throw err;
                                        let names = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            switch (row.type) {
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
                                } else {
                                    let names = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= 5) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
                                        switch (row.type) {
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
                                }
                            });
                        } else if (r.emoji.name == '📥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: `${userObject.user.username} (${nickname})`,
                                            icon_url: userObject.user.displayAvatarURL
                                        },
                                        description: `${userObject.user} joined the guild on ${joined}\n`,
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) throw err;
                                        let history = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
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
                                    let history = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= 5) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
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
                                }
                            });
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

                }).catch(console.error);
            } else if (globalUser) {
                message.channel.send({
                    embed: {
                        color: config.color_caution,
                        author: {
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                        },
                        thumbnail: {
                            url: globalUser.displayAvatarURL
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

                    let filter = (reaction, user) => !user.bot;
                    let collector = msg.createReactionCollector(filter);

                    autoClose = setTimeout(() => {
                        collector.stop();
                        msg.clearReactions();
                        msg.edit({
                            embed: {
                                color: config.color_caution,
                                author: {
                                    name: globalUser.username,
                                    icon_url: globalUser.displayAvatarURL
                                },
                                thumbnail: {
                                    url: globalUser.displayAvatarURL
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
                                    },
                                    {
                                        name: '**USERCARD CLOSED**',
                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                        collector = null;
                        filter = null;
                        msg = null;
                        guild = null;
                        userObject = null;
                        globalUser = null;
                        connection = null;
                    }, 300000);

                    collector.on('collect', async r => {
                        if (r.emoji.name == '👮') {
                            await r.remove(r.users.last());

                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                async function (err, rows, results) {
                                    if (err) {
                                        connection = functionsFile.establishConnection(client);
                                        connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted = 0 AND gub.actioner <> '001' UNION ALL
                                        SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                        SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            let events = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
                                                let actioner = client.users.get(row.actioner);
                                                if (!actioner) {
                                                    try {
                                                        actioner = await client.fetchUser(row.actioner);
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                                if (row.type == 'warn') {
                                                    await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`
                                                    );
                                                } else if (row.type == 'ban') {
                                                    await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                } else {
                                                    await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                        });
                                    } else {
                                        let events = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            if (row.type == 'warn') {
                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`
                                                );
                                            } else if (row.type == 'ban') {
                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                            } else {
                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                }
                            );
                        } else if (r.emoji.name == '🔈') {
                            await r.remove(r.users.last());

                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                            SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                            gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                            async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                    SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                    gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        let events = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            switch (row.type) {
                                                case 'mute':
                                                    await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                    break;
                                                case 'unmute':
                                                    await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                } else {
                                    let events = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
                                        let actioner = client.users.get(row.actioner);
                                        if (!actioner) {
                                            try {
                                                actioner = await client.fetchUser(row.actioner);
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                        switch (row.type) {
                                            case 'mute':
                                                await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                break;
                                            case 'unmute':
                                                await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                }
                            });
                        } else if (r.emoji.name == '❌') {
                            clearTimeout(autoClose);
                            collector.stop();
                            msg.delete().catch(console.error);
                            message.delete().catch(console.error);
                            collector = null;
                            filter = null;
                            msg = null;
                            guild = null;
                            userObject = null;
                            globalUser = null;
                            connection = null;
                        } else if (r.emoji.name == '✍') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        let notes = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            let actioner = client.users.get(row.actioner);
                                            if (!actioner) {
                                                try {
                                                    actioner = await client.fetchUser(row.actioner);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                } else {
                                    let notes = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
                                        let actioner = client.users.get(row.actioner);
                                        if (!actioner) {
                                            try {
                                                actioner = await client.fetchUser(row.actioner);
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                        await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                }
                            });
                        } else if (r.emoji.name == '🖥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                            async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        let notes = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= max) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
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
                                } else {
                                    let notes = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= max) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
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
                                }
                            });
                        }  else if (r.emoji.name == '📛') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                            SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                    SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) throw err;
                                        let names = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
                                            switch (row.type) {
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
                                } else {
                                    let names = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= 5) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
                                        switch (row.type) {
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
                                }
                            });
                        } else if (r.emoji.name == '👥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            msg.edit({
                                embed: {
                                    color: config.color_caution,
                                    author: {
                                        name: globalUser.username,
                                        icon_url: globalUser.displayAvatarURL
                                    },
                                    thumbnail: {
                                        url: globalUser.displayAvatarURL
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
                            }).catch(console.error);
                        } else if (r.emoji.name == '📥') {
                            await r.remove(r.users.last());
                            clearTimeout(autoClose);
                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: globalUser.username,
                                            icon_url: globalUser.displayAvatarURL
                                        },
                                        thumbnail: {
                                            url: globalUser.displayAvatarURL
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
                                            },
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                            [userID, userID], async function (err, rows, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) throw err;
                                        let history = [];
                                        let max = 5;
                                        let extra = 0;

                                        if (rows.length <= 5) {
                                            max = rows.length;
                                        } else {
                                            extra = rows.length - max;
                                        }

                                        for (let i = 0; i < max; i++) {
                                            const row = rows[i];
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
                                    let history = [];
                                    let max = 5;
                                    let extra = 0;

                                    if (rows.length <= 5) {
                                        max = rows.length;
                                    } else {
                                        extra = rows.length - max;
                                    }

                                    for (let i = 0; i < max; i++) {
                                        const row = rows[i];
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
                                }
                            });
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
                    if (err) {
                        connection = functionsFile.establishConnection(client);
                        connection.query('SELECT * FROM users WHERE userid = ? ORDER BY updated DESC LIMIT 1', userID,
                        async function (err, rows, results) {
                            if (err) throw err;
                            if (rows.length == 0) {
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
                            let cardUser = rows[0];
                            message.channel.send({
                                embed: {
                                    color: config.color_caution,
                                    author: {
                                        name: `${cardUser.username}`,
                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                    },
                                    title: `${cardUser.username} (${cardUser.userID})`,
                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).then(async msg => {

                                let filter = (reaction, user) => !user.bot;
                                let collector = msg.createReactionCollector(filter);

                                autoClose = setTimeout(() => {
                                    collector.stop();
                                    msg.clearReactions();
                                    msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: `${cardUser.username}`,
                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                            },
                                            title: `${cardUser.username} (${cardUser.userID})`,
                                            description: `This user could not be resolved. All data will be taken from the database.`,
                                            fields: [
                                                {
                                                    name: '**USERCARD CLOSED**',
                                                    value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                    cardUser = null;
                                    collector = null;
                                    filter = null;
                                    msg = null;
                                    guild = null;
                                    userObject = null;
                                    globalUser = null;
                                    connection = null;
                                }, 300000);

                                collector.on('collect', async r => {
                                    if (r.emoji.name == '👮') {
                                        await r.remove(r.users.last());

                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted AND gub.actioner <> '001' = 0 UNION ALL
                                            SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                            SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                            async function (err, rows, results) {
                                                if (err) {
                                                    connection = functionsFile.establishConnection(client);
                                                    connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted AND gub.actioner <> '001' = 0 UNION ALL
                                                    SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                                    SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                                    async function (err, rows, results) {
                                                        if (err) throw err;
                                                        let events = [];
                                                        let max = 5;
                                                        let extra = 0;

                                                        if (rows.length <= max) {
                                                            max = rows.length;
                                                        } else {
                                                            extra = rows.length - max;
                                                        }

                                                        for (let i = 0; i < max; i++) {
                                                            const row = rows[i];
                                                            let actioner = client.users.get(row.actioner);
                                                            if (!actioner) {
                                                                try {
                                                                    actioner = await client.fetchUser(row.actioner);
                                                                } catch (e) {
                                                                    console.log(e);
                                                                }
                                                            }
                                                            if (row.type == 'warn') {
                                                                await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                            } else if (row.type == 'ban') {
                                                                await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                            } else {
                                                                await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                                    });
                                                } else {
                                                    let events = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
                                                        let actioner = client.users.get(row.actioner);
                                                        if (!actioner) {
                                                            try {
                                                                actioner = await client.fetchUser(row.actioner);
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                        }
                                                        if (row.type == 'warn') {
                                                            await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                        } else if (row.type == 'ban') {
                                                            await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                        } else {
                                                            await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                            }
                                        );
                                    } else if (r.emoji.name == '🔈') {
                                        await r.remove(r.users.last());

                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                        SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                        gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                        async function (err, rows, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                                SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                                gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                                async function (err, rows, results) {
                                                    if (err) throw err;
                                                    let events = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
                                                        let actioner = client.users.get(row.actioner);
                                                        if (!actioner) {
                                                            try {
                                                                actioner = await client.fetchUser(row.actioner);
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                        }
                                                        switch (row.type) {
                                                            case 'mute':
                                                                await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                                break;
                                                            case 'unmute':
                                                                await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                            } else {
                                                let events = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
                                                    let actioner = client.users.get(row.actioner);
                                                    if (!actioner) {
                                                        try {
                                                            actioner = await client.fetchUser(row.actioner);
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                                    switch (row.type) {
                                                        case 'mute':
                                                            await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                            break;
                                                        case 'unmute':
                                                            await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                            }
                                        });
                                    } else if (r.emoji.name == '❌') {
                                        clearTimeout(autoClose);
                                        collector.stop();
                                        msg.delete().catch(console.error);
                                        message.delete().catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    } else if (r.emoji.name == '✍') {
                                        await r.remove(r.users.last());
                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);
                                        connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                        async function (err, rows, results ) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                                async function (err, rows, results ) {
                                                    if (err) throw err;
                                                    let notes = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++ ) {
                                                        const row = rows[i];
                                                        let actioner = client.users.get(row.actioner);
                                                        if (!actioner) {
                                                            try {
                                                                actioner = await client.fetchUser(row.actioner);
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                        }
                                                        await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                            } else {
                                                let notes = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++ ) {
                                                    const row = rows[i];
                                                    let actioner = client.users.get(row.actioner);
                                                    if (!actioner) {
                                                        try {
                                                            actioner = await client.fetchUser(row.actioner);
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                                    await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                            }
                                        });
                                    } else if (r.emoji.name == '🖥') {
                                        await r.remove(r.users.last());
                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                        async function (err, rows, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                                async function (err, rows, results) {
                                                    if (err) throw err;
                                                    let notes = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
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
                                            } else {
                                                let notes = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
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
                                            }
                                        });
                                    }  else if (r.emoji.name == '📛') {
                                        await r.remove(r.users.last());
                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                        SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                        [userID, userID], async function (err, rows, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                                SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                                [userID, userID], async function (err, rows, results) {
                                                    if (err) throw err;
                                                    let names = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= 5) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
                                                        switch (row.type) {
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
                                            } else {
                                                let names = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
                                                    switch (row.type) {
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
                                            }
                                        });
                                    }  else if (r.emoji.name == '👥') {
                                        await r.remove(r.users.last());
                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        await msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: cardUser.username,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    } else if (r.emoji.name == '📥') {
                                        await r.remove(r.users.last());
                                        clearTimeout(autoClose);
                                        autoClose = setTimeout(() => {
                                            collector.stop();
                                            msg.clearReactions();
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: `${cardUser.username}`,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                    },
                                                    title: `${cardUser.username} (${cardUser.userID})`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    fields: [
                                                        {
                                                            name: '**USERCARD CLOSED**',
                                                            value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                            cardUser = null;
                                            collector = null;
                                            filter = null;
                                            msg = null;
                                            guild = null;
                                            userObject = null;
                                            globalUser = null;
                                            connection = null;
                                        }, 300000);

                                        connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                        [userID, userID], async function (err, rows, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                                [userID, userID], async function (err, rows, results) {
                                                    if (err) throw err;
                                                    let history = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= 5) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
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
                                                        }).catch(console.error);
                                                    }
                                                });
                                            } else {
                                                let history = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
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
                                                    }).catch(console.error);
                                                }
                                            }
                                        });
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
                    } else {
                        if (rows.length == 0) {
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
                            msg = null;
                        }
                        let cardUser = rows[0];
                        message.channel.send({
                            embed: {
                                color: config.color_caution,
                                author: {
                                    name: `${cardUser.username}`,
                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                },
                                title: `${cardUser.username} (${cardUser.userID})`,
                                description: `This user could not be resolved. All data will be taken from the database.`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).then(async msg => {

                            let filter = (reaction, user) => !user.bot;
                            let collector = msg.createReactionCollector(filter);

                            autoClose = setTimeout(() => {
                                collector.stop();
                                msg.clearReactions();
                                msg.edit({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: `${cardUser.username}`,
                                            icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                        },
                                        title: `${cardUser.username} (${cardUser.userID})`,
                                        description: `This user could not be resolved. All data will be taken from the database.`,
                                        fields: [
                                            {
                                                name: '**USERCARD CLOSED**',
                                                value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                                cardUser = null;
                                collector = null;
                                filter = null;
                                msg = null;
                                guild = null;
                                userObject = null;
                                globalUser = null;
                                connection = null;
                            }, 300000);

                            collector.on('collect', async r => {
                                if (r.emoji.name == '👮') {
                                    await r.remove(r.users.last());

                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted AND gub.actioner <> '001' = 0 UNION ALL
                                        SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                        SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                        async function (err, rows, results) {
                                            if (err) {
                                                connection = functionsFile.establishConnection(client);
                                                connection.query(`(SELECT 'unban' AS \`type\`, gub.* FROM log_guildunbans gub WHERE gub.userid = ${connection.escape(userID)} AND gub.isDeleted AND gub.actioner <> '001' = 0 UNION ALL
                                                SELECT 'ban' AS \`type\`, gb.* FROM log_guildbans gb WHERE gb.userid = ${connection.escape(userID)} AND gb.isDeleted = 0 AND gb.actioner <> '001' UNION ALL
                                                SELECT 'warn' AS \`type\`, w.* FROM log_warn w WHERE w.userid = ${connection.escape(userID)} AND w.isDeleted = 0) ORDER BY timestamp DESC`,
                                                async function (err, rows, results) {
                                                    if (err) throw err;
                                                    let events = [];
                                                    let max = 5;
                                                    let extra = 0;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra = rows.length - max;
                                                    }

                                                    for (let i = 0; i < max; i++) {
                                                        const row = rows[i];
                                                        let actioner = client.users.get(row.actioner);
                                                        if (!actioner) {
                                                            try {
                                                                actioner = await client.fetchUser(row.actioner);
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                        }
                                                        if (row.type == 'warn') {
                                                            await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                        } else if (row.type == 'ban') {
                                                            await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                        } else {
                                                            await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                                });
                                            } else {
                                                let events = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
                                                    let actioner = client.users.get(row.actioner);
                                                    if (!actioner) {
                                                        try {
                                                            actioner = await client.fetchUser(row.actioner);
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                                    if (row.type == 'warn') {
                                                        await events.push(`\`${row.identifier}\` ❗ Warning by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                    } else if (row.type == 'ban') {
                                                        await events.push(`\`${row.identifier}\` ⚔ Banned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
                                                    } else {
                                                        await events.push(`\`${row.identifier}\` 🛡 Unbanned by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n`);
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
                                        }
                                    );
                                } else if (r.emoji.name == '🔈') {
                                    await r.remove(r.users.last());

                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                    SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                    gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                    async function (err, rows, results) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query(`(SELECT 'mute' AS \`type\`, gm.* FROM log_mutes gm WHERE gm.userID = ${connection.escape(userID)} AND gm.isDeleted = 0 UNION ALL
                                            SELECT 'unmute' AS \`type\`, gum.ID, gum.userID, gum.actioner, gum.description, NULL AS length, gum.identifier, gum.isDeleted, gum.timestamp,
                                            gum.updated FROM log_unmutes gum WHERE gum.userID = ${connection.escape(userID)} AND gum.isDeleted = 0) ORDER BY timestamp DESC`,
                                            async function (err, rows, results) {
                                                if (err) throw err;
                                                let events = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
                                                    let actioner = client.users.get(row.actioner);
                                                    if (!actioner) {
                                                        try {
                                                            actioner = await client.fetchUser(row.actioner);
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                                    switch (row.type) {
                                                        case 'mute':
                                                            await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                            break;
                                                        case 'unmute':
                                                            await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                        } else {
                                            let events = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
                                                let actioner = client.users.get(row.actioner);
                                                if (!actioner) {
                                                    try {
                                                        actioner = await client.fetchUser(row.actioner);
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                                switch (row.type) {
                                                    case 'mute':
                                                        await events.push(`\`${row.identifier}\` 🔇 Mute by ${actioner} on ${row.timestamp.toUTCString()} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                                                        break;
                                                    case 'unmute':
                                                        await events.push(`\`${row.identifier}\` 🔊 Unmute by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                        }
                                    });
                                } else if (r.emoji.name == '❌') {
                                    clearTimeout(autoClose);
                                    collector.stor();
                                    msg.delete().catch(console.error);
                                    message.delete().catch(console.error);
                                    cardUser = null;
                                    collector = null;
                                    filter = null;
                                    msg = null;
                                    guild = null;
                                    userObject = null;
                                    globalUser = null;
                                    connection = null;
                                } else if (r.emoji.name == '✍') {
                                    await r.remove(r.users.last());
                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results ) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query('SELECT * FROM log_note WHERE userID = ? AND isDeleted = 0 AND actioner <> \'001\' ORDER BY timestamp DESC', userID,
                                            async function (err, rows, results ) {
                                                if (err) throw err;
                                                let notes = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++ ) {
                                                    const row = rows[i];
                                                    let actioner = client.users.get(row.actioner);
                                                    if (!actioner) {
                                                        try {
                                                            actioner = await client.fetchUser(row.actioner);
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                                    await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                        } else {
                                            let notes = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++ ) {
                                                const row = rows[i];
                                                let actioner = client.users.get(row.actioner);
                                                if (!actioner) {
                                                    try {
                                                        actioner = await client.fetchUser(row.actioner);
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                                await notes.push(`\`${row.identifier}\` 📌 Note by ${actioner} on ${row.timestamp.toUTCString()} \n \`\`\`${row.description}\`\`\`\n\n`);
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
                                        }
                                    });
                                } else if (r.emoji.name == '🖥') {
                                    await r.remove(r.users.last());
                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                    async function (err, rows, results) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query('SELECT * from log_note WHERE userID = ? AND isDeleted = 0 AND actioner = \'001\' ORDER BY timestamp DESC', userID,
                                            async function (err, rows, results) {
                                                if (err) throw err;
                                                let notes = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= max) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
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
                                        } else {
                                            let notes = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
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
                                        }
                                    });
                                }  else if (r.emoji.name == '📛') {
                                    await r.remove(r.users.last());
                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                    SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query(`(SELECT 'user' as \`type\`, u.* FROM log_username u WHERE u.userID = ? UNION ALL
                                            SELECT 'nick' as \`type\`, n.* FROM log_nickname n WHERE n.userID = ?) ORDER BY timestamp DESC`,
                                            [userID, userID], async function (err, rows, results) {
                                                if (err) throw err;
                                                let names = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
                                                    switch (row.type) {
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
                                        } else {
                                            let names = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
                                                switch (row.type) {
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
                                        }
                                    });
                                }  else if (r.emoji.name == '👥') {
                                    await r.remove(r.users.last());
                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    await msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: cardUser.username,
                                                icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                            },
                                            title: `${cardUser.username} (${cardUser.userID})`,
                                            description: `This user could not be resolved. All data will be taken from the database.`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else if (r.emoji.name == '📥') {
                                    await r.remove(r.users.last());
                                    clearTimeout(autoClose);
                                    autoClose = setTimeout(() => {
                                        collector.stop();
                                        msg.clearReactions();
                                        msg.edit({
                                            embed: {
                                                color: config.color_caution,
                                                author: {
                                                    name: `${cardUser.username}`,
                                                    icon_url: `https://cdn.discordapp.com/avatars/${cardUser.userID}/${cardUser.avatar}.jpg`
                                                },
                                                title: `${cardUser.username} (${cardUser.userID})`,
                                                description: `This user could not be resolved. All data will be taken from the database.`,
                                                fields: [
                                                    {
                                                        name: '**USERCARD CLOSED**',
                                                        value: `This usercard was automatically closed after 5m of inactivity. To open it again, run \`${config.prefix}user ${userID}\``
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                        cardUser = null;
                                        collector = null;
                                        filter = null;
                                        msg = null;
                                        guild = null;
                                        userObject = null;
                                        globalUser = null;
                                        connection = null;
                                    }, 300000);

                                    connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                    [userID, userID], async function (err, rows, results) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query(`SELECT Status, timestamp FROM(SELECT *, 'join' AS Status FROM log_guildjoin WHERE userid = ? UNION SELECT *, 'leave' AS Status FROM log_guildleave WHERE userid = ?) a ORDER BY timestamp DESC`,
                                            [userID, userID], async function (err, rows, results) {
                                                if (err) throw err;
                                                let history = [];
                                                let max = 5;
                                                let extra = 0;

                                                if (rows.length <= 5) {
                                                    max = rows.length;
                                                } else {
                                                    extra = rows.length - max;
                                                }

                                                for (let i = 0; i < max; i++) {
                                                    const row = rows[i];
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
                                                    }).catch(console.error);
                                                }
                                            });
                                        } else {
                                            let history = [];
                                            let max = 5;
                                            let extra = 0;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (let i = 0; i < max; i++) {
                                                const row = rows[i];
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
                                                }).catch(console.error);
                                            }
                                        }
                                    });
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
                    }
                });
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}
