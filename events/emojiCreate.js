module.exports = (client, emoji) => {
  const modulesFile = client.modulesFile;
  const channelsFile = client.channelsFile;
  const guild = emoji.guild;

  if (modulesFile.get('EVENT_EMOJI_CREATE')) {
    if (channelsFile.get('server_log')) {
      if (guild.channels.get(channelsFile.get('server_log'))) {
        guild.channels.get(channelsFile.get('server_log')).send({
          embed: {
            color: client.config.color_info,
            title: 'Emoji creation',
            thumbnail: {
              icon_url: emoji.url
            },
            description: `Emoji ${emoji} has been created`,
            fields: [
              {
                name: 'Name',
                value: `${emoji.name}`,
                inline: true
              },
              {
                name: 'ID',
                value: `${emoji.id}`,
                inline: true
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