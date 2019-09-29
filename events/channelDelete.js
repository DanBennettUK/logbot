module.exports = (client, channel) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    if (modulesFile.get('EVENT_CHANNEL_DELETE_LOG')) {
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
            channel.guild.channels.get(config.channel_serverlog).send({
                embed: {
                    color: config.color_warning,
                    author: {
                        name: channel.guild.name,
                        icon_url: channel.guild.iconURL
                    },
                    title: `${channelType} deletion`,
                    description: `${channelType} ${channel} has been deleted`,
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