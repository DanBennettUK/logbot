module.exports = (client, oldEmoji, newEmoji) => {
    const modulesFile = client.modulesFile;
    const channelsFile = client.channelsFile;
    const guild = oldEmoji.guild;
  
    if (modulesFile.get('EVENT_EMOJI_UPDATE')) {
      if (channelsFile.get('server_log')) {
        if (guild.channels.get(channelsFile.get('server_log'))) {
            guild.channels.get(channelsFile.get('server_log')).send({
                embed: {
                    color: client.config.color_info,
                    title: 'Emoji update',
                    thumbnail: {
                        icon_url: newEmoji.url
                    },
                    description: `Emoji ${newEmoji} has been updated`,
                    fields: [
                        {
                        name: 'Old name',
                        value: `${oldEmoji.name}`,
                        inline: true
                        },
                        {
                            name: 'New name',
                            value: `${newEmoji.name}`,
                            inline: true
                        },
                        {
                        name: 'ID',
                        value: `${newEmoji.id}`,
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${client.config.version}`
                    }
                }
          }).catch(console.error);
        }
      }
    }
  }