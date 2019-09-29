module.exports = async (client, oldMember, newMember) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE')) {
        //Checking for nickname changes for logging
        if (oldMember.displayName !== newMember.displayName) {
            var data = [newMember.user.id, newMember.displayName, oldMember.displayName, new Date()];
            connection.query('INSERT INTO log_nickname (userID, new, old, timestamp) VALUES (?,?,?,?)',data,
                function (err, results) {
                    if (err) throw err;
                }
            );
            if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE_LOG')) {
                oldMember.guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${oldMember.user.username}#${oldMember.user.discriminator}`,
                            icon_url: oldMember.user.displayAvatarURL
                        },
                        title: 'Nickname change',
                        thumbnail: {
                            url: oldMember.user.displayAvatarURL
                        },
                        description: `User ${oldMember.user} has changed their nickname\n`,
                        fields: [
                            {
                                name: 'Old nickname',
                                value: oldMember.displayName,
                                inline: true
                            },
                            {
                                name: 'New nickname',
                                value: newMember.displayName,
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
        if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE_ROLES_LOG')) {
            if (oldMember.roles.size > newMember.roles.size) {
                var role = oldMember.roles.filter(r => !newMember.roles.has(r.id)).first();
                await oldMember.guild.fetchAuditLogs({
                    type: 'MEMBER_ROLE_UPDATE'
                }).then(audit => {
                    var description = `Role ${role} removed from user ${oldMember.user}`;
                    for (var i = 0; i < audit.entries.array().length; i++) {
                        if (audit.entries.array()[i].target == oldMember.user) {
                            description += ` by ${audit.entries.array()[i].executor}`;
                            break;
                        }
                    }
                    oldMember.guild.channels.get(config.channel_serverlog).send({
                        embed: {
                            color: config.color_warning,
                            author: {
                                name: `${oldMember.user.username}#${oldMember.user.discriminator}`,
                                icon_url: oldMember.user.displayAvatarURL
                            },
                            title: 'Role removal',
                            description: description,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                }).catch(console.error);
            }
            if (newMember.roles.size > oldMember.roles.size) {
                var role = newMember.roles.filter(r => !oldMember.roles.has(r.id)).first();
                await newMember.guild.fetchAuditLogs({
                    type: 'MEMBER_ROLE_UPDATE'
                }).then(audit => {
                    var description = `Role ${role} added to user ${newMember.user}`;
                    for (var i = 0; i < audit.entries.array().length; i++) {
                        if (audit.entries.array()[i].target == newMember.user) {
                            description += ` by ${audit.entries.array()[i].executor}`;
                            break;
                        }
                    }
                    oldMember.guild.channels.get(config.channel_serverlog).send({
                        embed: {
                            color: config.color_success,
                            author: {
                                name: `${newMember.user.username}#${newMember.user.discriminator}`,
                                icon_url: newMember.user.displayAvatarURL
                            },
                            title: 'Role addition',
                            description: description,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                }).catch(console.error);
            }
        }
    }
}