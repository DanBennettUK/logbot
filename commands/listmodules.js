exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const _ = client.underscore;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        var file = modulesFile.get();
        var moduleNames = _.keys(file);
        var moduleValues = _.values(file);

        message.channel.send({
            embed: {
                color: config.color_info,
                author: {
                    name: client.user.username,
                    icon_url: client.user.displayAvatarURL
                },
                title: '[COMMAND] List Modules',
                fields: [{
                        name: 'Module',
                        value: moduleNames.join('\n'),
                        inline: true
                    },
                    {
                        name: 'State',
                        value: moduleValues.join('\n'),
                        inline: true
                    },
                    {
                        name: 'Note',
                        value: 'If you would like a module enabling/disabling. Please ask an Admin.'
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        });
    } //End of permission checking statement
}