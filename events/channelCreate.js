module.exports = (client, channel) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const channelsFile = client.channelsFile;
    if (channelsFile.get('server_log')) {
        if (!channel.guild.channels.get(channelsFile.get('server_log'))) {
            channelsFile.set('server_log', '');
            channelsFile.save();
            return;
        }
        if (modulesFile.get('EVENT_CHANNEL_CREATE_LOG')) {
            if (![`dm`, `group`].includes(channel.type)) {
                var channelType = 'Channel'
                if (channel.type == `text`) {
                    channelType = `Text channel`;
                } else if (channel.type == `voice`) {
                    channelType = `Voice channel`;
                } else if (channel.type == `category`) {
                    channelType = `Category`;
                } else if (channel.type == `news`) {
                    channelType = `News channel`;
                } else if (channel.type == `store`) {
                    channelType = `Store channel`;
                }
                channel.guild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_success,
                        author: {
                            name: channel.guild.name,
                            icon_url: channel.guild.iconURL
                        },
                        title: `${channelType} creation`,
                        description: `${channelType} ${channel} has been created`,
                        fields: [
                            {
                                name: 'Name',
                                value: `${channel.name}`,
                                inline: true
                            },
                            {
                                name: 'ID',
                                value: `${channel.id}`,
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