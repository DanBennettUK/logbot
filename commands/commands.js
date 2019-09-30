exports.run = (client, message, args) => {
    const customCommands = client.customCommands;
    const functionsFile = client.functionsFile;
    const config = client.config;
    const _ = client.underscore;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (args[0] && args[0].toLowerCase() === 'add') {
                if (args[1]) {
                    var commandStr = _.rest(args, 2).join(' ');
                    customCommands.set(args[1] + '.content', commandStr);
                    customCommands.save();
                    message.channel.send(':white_check_mark: Command added successfully.');
                } else functionsFile.syntaxErr(client, message, `commands add`);
            }
            if (args[0] && args[0].toLowerCase() === 'remove') {
                if (args[1]) {
                    customCommands.unset(args[1]);
                    customCommands.save();
                    message.channel.send(':white_check_mark: Command removed successfully.');
                } else functionsFile.syntaxErr(client, message, `commands remove`);
            }
        }
        if (args[0] && args[0].toLowerCase() === 'list') {
            var cKeys = _.keys(customCommands.read());
            var numberOfCommands = 0;
            var allCommands = '';
            var plural = 'commands';
            for (var i = 0; i < cKeys.length; i++) {
                if (allCommands.length > 1900) {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            title: `**Listing ${numberOfCommands} custom ${plural}:**`,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            description: `${allCommands}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                    allCommands = ``;
                    numberOfCommands = 0;
                }
                numberOfCommands++;
                allCommands +=`\n **${cKeys[i]}:** ${customCommands.get(cKeys[i]).content}`;
                if (numberOfCommands == 1) {
                    plural = 'command';
                } else plural = 'commands';
                if (i === (cKeys.length - 1)) {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            title: `**Listing ${numberOfCommands} custom ${plural}:**`,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            description: `${allCommands}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                }
            }
        }
    }
}