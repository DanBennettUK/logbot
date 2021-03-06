exports.run = async (client, message, args) => {
    const functionsFile = client.functionsFile;
    let connection = client.connection;
    const modulesFile = client.modulesFile;
    if (message.member.roles.some(r => r.name == 'Moderators')) {
        if (modulesFile.get('COMMAND_VCLOG')) {
            if (args.length > 0) {
                let id = functionsFile.parseChannelTag(client, message.guild, args.join(' '));
                if (id == 'err') {
                    if (args.length < 3 && !/[0-9]/.test(args.slice(args.length, 1).join(' '))) {
                        switch (args[0].toLowerCase()) {
                            case 'the':
                                switch (args[1].toLowerCase()) {
                                    case 'office':
                                        args.unshift('🔒');
                                        break;
                                    case 'cabin':
                                        args.unshift('🏠');
                                        break;
                                    case 'studio':
                                        args.unshift('🎤');
                                        break;

                                }
                                break;
                            case 'general':
                                args.unshift('🔊');
                                break;
                            case 'squad':
                                args.unshift('🔫');
                                break;
                            case 'duo':
                                args.unshift('👥');
                                break;
                            case 'customs':
                                args.unshift('🛠');
                                break;
                            case 'afk':
                                args.unshift('☕');
                                break;
                            case 'office':
                                args.unshift('the');
                                args.unshift('🔒');
                                break;
                            case 'cabin':
                                args.unshift('the');
                                args.unshift('🏠');
                                break;
                            case 'studio':
                                args.unshift('the');
                                args.unshift('🎤');
                                break;
                        }
                    }
                }
                id = functionsFile.parseChannelTag(client, message.guild, args.join(' '));
                let channel = null;
                if (id != 'err') channel = await message.guild.channels.get(id);
                if (channel == null) {
                    message.channel.send(`I could not parse that channel. \`${args.join(' ')}\``).catch(console.error);
                    return;
                } else if (channel.type != 'voice') {
                    message.channel.send(`The provided channel \`${args.join(' ')}\` is not a voice channel.`).catch(console.error);
                    return;
                }
                message.channel.send({
                    embed: {
                        color: client.config.color_info,
                        title: `Viewing the logs of ${channel.name}`,
                        description: `Loading data...`,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${client.config.version}`
                        }
                    }
                }).then(async msg => {
                    connection.query(`SELECT * FROM log_voice WHERE newChannelID = ${id} ORDER BY timestamp DESC LIMIT 30`,
                        async function (err, rows, results) {
                            if (err) {
                                connection = functionsFile.establishConnection(client);
                                connection.query(`SELECT * FROM log_voice WHERE newChannelID = ${id} ORDER BY timestamp DESC LIMIT 30`,
                                    async function (err, rows, results) {
                                        if (err) throw err;
                                        if (rows && rows.length > 0) {
                                            let users = '';
                                            let joinTime = '';
                                            let i = 0;
                                            for (row of rows) {
                                                if (i == 30) break;
                                                let user = client.users.get(row.userID);
                                                if (!user) {
                                                    try {
                                                        user = await client.fetchUser(row.userID);
                                                    } catch (e) {
                                                        message.channel.send(`${row.userID} could not be found.`).catch(console.error);
                                                    }
                                                }
                                                users += `${user}\n`;
                                                joinTime += `${row.timestamp.toUTCString()}\n`;
                                                i++;
                                            }
                                            msg.edit({
                                                embed: {
                                                    color: client.config.color_info,
                                                    title: `Viewing the logs of ${channel.name}`,
                                                    fields: [{
                                                            name: 'User',
                                                            value: `${users}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: 'Joined at',
                                                            value: `${joinTime}`,
                                                            inline: true
                                                        }
                                                    ],
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                        } else msg.edit({
                                            embed: {
                                                color: client.config.color_info,
                                                title: `Viewing the logs of ${channel.name}`,
                                                description: `No users were in the specified channel.`,
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    });
                            } else {
                                if (rows && rows.length > 0) {
                                    let users = '';
                                    let joinTime = '';
                                    let i = 0;
                                    for (row of rows) {
                                        if (i == 30) break;
                                        let user = client.users.get(row.userID);
                                        if (!user) {
                                            try {
                                                user = await client.fetchUser(row.userID);
                                            } catch (e) {
                                                message.channel.send(`${row.userID} could not be found.`).catch(console.error);
                                            }
                                        }
                                        users += `${user}\n`;
                                        joinTime += `${row.timestamp.toUTCString()}\n`;
                                        i++;
                                    }
                                    msg.edit({
                                        embed: {
                                            color: client.config.color_info,
                                            title: `Viewing the logs of ${channel.name}`,
                                            fields: [{
                                                    name: 'User',
                                                    value: `${users}`,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Joined at',
                                                    value: `${joinTime}`,
                                                    inline: true
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                } else msg.edit({
                                    embed: {
                                        color: client.config.color_info,
                                        title: `Viewing the logs of ${channel.name}`,
                                        description: `No users were in the specified channel.`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                        }
                                    }
                                }).catch(console.error);
                            }
                        });
                }).catch(console.error);
            } else functionsFile.syntaxErr(client, message, 'vclog');
        } else message.channel.send(':x: That module is disabled.').catch(console.error);
    }
}