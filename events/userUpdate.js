module.exports = (client, oldUser, newUser) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    const guild = client.guilds.get(config.guildid)
    if (modulesFile.get('EVENT_USER_UPDATE')) {
        //Checking for username changes for logging
        if (oldUser.username !== newUser.username) {
            var data = [newUser.id, newUser.username, oldUser.username, new Date()];
            connection.query('INSERT INTO log_username (userID, new, old, timestamp) VALUES (?,?,?,?)', data, function (err, results) {
                    if (err) throw err;
                }
            );
            if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${newUser.username}#${newUser.discriminator}`,
                            icon_url: newUser.displayAvatarURL
                        },
                        title: 'Username change',
                        thumbnail: {
                            url: newUser.displayAvatarURL
                        },
                        description: `User ${newUser} has changed their username\n`,
                        fields: [
                            {
                                name: 'Previous username',
                                value: `${oldUser.username}`,
                                inline: true
                            },
                            {
                                name: 'New username',
                                value: `${newUser.username}`,
                                inline: true
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

        //Checking for avatar changes to update user table
        if (oldUser.avatar !== newUser.avatar) {
            var data = [newUser.avatar, new Date(), newUser.id];
            connection.query('UPDATE users SET avatar = ?, updated = ? WHERE userID = ?', data,
                function (err, results) {
                    if (err) throw err;
                }
            );
            if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${newUser.username}#${newUser.discriminator}`,
                            icon_url: newUser.displayAvatarURL
                        },
                        title: 'Avatar change',
                        thumbnail: {
                            url: newUser.displayAvatarURL
                        },
                        description: `User ${newUser} has changed their avatar`,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            }
        }
        if (oldUser.discriminator !== newUser.discriminator) {
            if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${newUser.username}#${newUser.discriminator}`,
                            icon_url: newUser.displayAvatarURL
                        },
                        title: 'Discriminator change',
                        thumbnail: {
                            url: newUser.displayAvatarURL
                        },
                        description: `User ${newUser} has changed their discriminator\n`,
                        fields: [
                            {
                                name: 'Previous discriminator',
                                value: `${oldUser.discriminator}`,
                                inline: true
                            },
                            {
                                name: 'New discriminator',
                                value: `${newUser.discriminator}`,
                                inline: true
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
}