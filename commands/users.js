exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const config = client.config;
    const functionsFile = client.functionsFile;
    if (args[0] && args[0].toLowerCase() == 'count') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (modulesFile.get('COMMAND_USER_COUNT')) {
                connection.query('SELECT COUNT(*) AS TotalUsers FROM users',
                    function (err, result) {
                        if (err) {
                            connection = functionsFile.establishConnection(client);
                            connection.query('SELECT COUNT(*) AS TotalUsers FROM users',
                            function (err, result) {
                                if (err) throw err;
                                if (result) {
                                    message.channel.send({
                                        embed: {
                                            color: config.color_info,
                                            author: {
                                                name: client.user.username,
                                                icon_url: client.user.displayAvatarURL
                                            },
                                            title: '[COMMAND] User count',
                                            description: 'The current count of users known to us',
                                            fields: [{
                                                    name: 'Total user count',
                                                    value: result[0].TotalUsers
                                                },
                                                {
                                                    name: 'Note',
                                                    value: 'This number includes users past and present.'
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
                            if (result) {
                                message.channel.send({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: client.user.username,
                                            icon_url: client.user.displayAvatarURL
                                        },
                                        title: '[COMMAND] User count',
                                        description: 'The current count of users known to us',
                                        fields: [{
                                                name: 'Total user count',
                                                value: result[0].TotalUsers
                                            },
                                            {
                                                name: 'Note',
                                                value: 'This number includes users past and present.'
                                            }
                                        ],
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
            } else {
                message.channel.send(`:x: That module is disabled.`).catch(console.error);
            }
        } //End of permission checking statement
    }
    if (args[0] && args[0].toLowerCase() == 'update') {
        if (message.member.roles.some(role => ['Admins'].includes(role.name))) {
            if (modulesFile.get('COMMAND_USER_UPDATE')) {
                functionsFile.updateUserTable(client, 'user', message.channel.id);
            } else {
                message.channel.send(`:x: That module is disabled.`).catch(console.error);
            }
        }
    }
}