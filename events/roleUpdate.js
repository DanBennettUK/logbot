module.exports = (oldRole, newRole) => {
    if (modulesFile.get('EVENT_ROLE_UPDATE_LOG')) {
        if (oldRole.name !== newRole.name) {
            oldRole.guild.channels.get(config.channel_serverlog).send({
                embed: {
                    color: config.color_info,
                    author: {
                        name: oldRole.guild.name,
                        iconURL: oldRole.guild.iconURL
                    },
                    title: 'Role edit',
                    description: `Role ${oldRole} has been edited`,
                    fields: [
                        {
                            name: 'Old name',
                            value: `${oldRole.name}`,
                            inline: true
                        },
                        {
                            name: 'New name',
                            value: `${newRole.name}`,
                            inline: true
                        },
                        {
                            name: 'ID',
                            value: `${newRole.id}`
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            }).catch(console.error);
        }
        if (oldRole.permissions !== newRole.permissions) { // credit to Gab
            const { Permissions } = require(`discord.js`);
            const entry = await guild.fetchAuditLogs({
                type: 'ROLE_UPDATE'
            }).then(audit => audit.entries.first());
            const changes = entry.changes;

            const newPermissions = new Permissions(parseInt(changes[0].new));
            const oldPermissions = new Permissions(parseInt(changes[0].old));

            const filteredNewPermissions = newPermissions.toArray().filter(function (x) {
                return oldPermissions.toArray().indexOf(x) < 0;
            });

            const capitalizeNewPermissions = newPermissionsArray => newPermissionsArray.map(name =>
                name.split('_').map(word =>
                    word[0].toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')
            );

            const capitalizedNewPermissions = capitalizeNewPermissions(filteredNewPermissions);

            const filteredOldPermissions = oldPermissions.toArray().filter(function (x) {
                return newPermissions.toArray().indexOf(x) < 0;
            });

            const capitalizeOldPermissions = oldPermissionsArray => oldPermissionsArray.map(name =>
                name.split('_').map(word =>
                    word[0].toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')
            );

            const capitalizedOldPermissions = capitalizeOldPermissions(filteredOldPermissions);

            if (filteredNewPermissions.length !== 0 && filteredOldPermissions.length !== 0) {
                oldRole.guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: oldRole.guild.name,
                            icon_url: oldRole.guild.iconURL
                        },
                        title: 'Role edit',
                        description: `Permissions of role ${oldRole} have been edited`,
                        fields: [
                            {
                                name: 'Added',
                                value: `${capitalizedNewPermissions}`
                            },
                            {
                                name: 'Removed',
                                value: `${capitalizedOldPermissions}`
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            } else if (filteredNewPermissions.length !== 0 && filteredOldPermissions.length === 0) {
                oldRole.guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: oldRole.guild.name,
                            icon_url: oldRole.guild.iconURL
                        },
                        title: 'Role edit',
                        description: `Permissions of role ${oldRole} have been edited`,
                        fields: [
                            {
                                name: 'Added',
                                value: `${capitalizedNewPermissions}`
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            } else if (filteredNewPermissions.length === 0 && filteredOldPermissions.length !== 0) {
                oldRole.guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: oldRole.guild.name,
                            icon_url: oldRole.guild.iconURL
                        },
                        title: 'Role edit',
                        description: `Permissions of role ${oldRole} have been edited`,
                        fields: [
                            {
                                name: 'Removed',
                                value: `${capitalizedOldPermissions}`
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