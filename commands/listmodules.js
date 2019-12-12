exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const _ = client.underscore;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        var file = modulesFile.get();
        var moduleNames = _.keys(file);
        var moduleValues = _.values(file);

        var joinedNames = '';
        var joinedValues = '';
        var amount = 0;

        moduleNames.forEach((name, index) => {
            if (joinedNames.length > 900) {
                message.channel.send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                        },
                        title: '[COMMAND] List Modules',
                        description: `Listing ${amount} modules`,
                        fields: [{
                                name: 'Module',
                                value: joinedNames,
                                inline: true
                            },
                            {
                                name: 'State',
                                value: joinedValues,
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
                }).catch(console.error);
                joinedNames = '';
                joinedValues = '';
                amount = 0;
            }
            joinedNames += `\n${name}`;
            joinedValues += `\n${moduleValues[index]}`
            amount++;
            if (index == moduleNames.length - 1) {
                message.channel.send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                        },
                        title: '[COMMAND] List Modules',
                        description: `Listing ${amount} modules`,
                        fields: [{
                                name: 'Module',
                                value: joinedNames,
                                inline: true
                            },
                            {
                                name: 'State',
                                value: joinedValues,
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
                }).catch(console.error);
            }
        });
    } //End of permission checking statement
}