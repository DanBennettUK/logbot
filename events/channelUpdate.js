module.exports = (client, oldChannel, newChannel) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const channelsFile = client.channelsFile;
    if (channelsFile.get('server_log')) {
        if (modulesFile.get('EVENT_CHANNEL_UPDATE_LOG')) {
            if (![`dm`, `group`].includes(oldChannel.type)) {
                if (!oldChannel.guild.channels.get(channelsFile.get('server_log'))) {
                    channelsFile.set('server_log', '');
                    channelsFile.save();
                    return;
                }
                var channelType = 'Channel'
                if (oldChannel.type == `text`) {
                    channelType = `Text channel`;
                } else if (oldChannel.type == `voice`) {
                    channelType = `Voice channel`;
                } else if (oldChannel.type == `category`) {
                    channelType = `Category`;
                } else if (oldChannel.type == `news`) {
                    channelType = `News channel`;
                } else if (oldChannel.type == `store`) {
                    channelType = `Store channel`;
                }
                if (oldChannel.name !== newChannel.name) {
                    oldChannel.guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: oldChannel.guild.name,
                                icon_url: oldChannel.guild.iconURL
                            },
                            title: `${channelType} name change`,
                            description: `Name of ${channelType.toLowerCase()} ${newChannel} has been changed`,
                            fields: [
                                {
                                    name: 'Old name',
                                    value: `${oldChannel.name}`,
                                    inline: true
                                },
                                {
                                    name: 'New name',
                                    value: `${newChannel.name}`,
                                    inline: true
                                },
                                {
                                    name: 'ID',
                                    value: `${oldChannel.id}`
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
}