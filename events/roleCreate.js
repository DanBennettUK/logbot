module.exports = (client, role) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const channelsFile = client.channelsFile;
    if (channelsFile.get('server_log')) {
        if (!role.guild.channels.get(channelsFile.get('server_log'))) {
            return;
        }
        if (modulesFile.get('EVENT_ROLE_CREATE_LOG')) {
            role.guild.channels.get(channelsFile.get('server_log')).send({
                embed: {
                    color: config.color_success,
                    author: {
                        name: role.guild.name,
                        icon_url: role.guild.iconURL
                    },
                    title: 'Role creation',
                    description: `Role ${role} has been created`,
                    fields: [
                        {
                            name: 'Role',
                            value: `${role.name}`,
                            inline: true
                        },
                        {
                            name: 'ID',
                            value: `${role.id}`,
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