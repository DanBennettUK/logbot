module.exports = (client, oldGuild, newGuild) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const channelsFile = client.channelsFile;
    if (channelsFile.get('server_log')) {
        if (!oldGuild.channels.get(channelsFile.get('server_log'))) {
            channelsFile.set('server_log', '');
            channelsFile.save();
            return;
        }
        if (modulesFile.get('EVENT_GUILD_UPDATE_LOG')) {
            if (oldGuild.name !== newGuild.name) {
                oldGuild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${newGuild.name}`,
                            icon_url: newGuild.iconURL
                        },
                        title: 'Guild name change',
                        fields: [
                            {
                                name: 'Before',
                                value: `${oldGuild.name}`,
                                inline: true
                            },
                            {
                                name: 'After',
                                value: `${newGuild.name}`,
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
            if (oldGuild.iconURL != newGuild.iconURL) {
                oldGuild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: `${newGuild.name}`,
                            icon_url: newGuild.iconURL
                        },
                        title: 'Guild icon change',
                        thumbnail: {
                            url: newGuild.iconURL
                        },
                        description: 'Guild icon has been updated',
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