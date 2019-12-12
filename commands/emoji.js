exports.run = async (client, message, args) => {
    const config = client.config;
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const guild = message.guild;

    if (modulesFile.get('COMMAND_EMOJI')) {
        if (message.member.roles.some(role => 'Moderators' == role.name)) {
            if (args.length > 0) {
                if (args[0].toLowerCase() === `add` && args.length > 1) {
                    if (!(guild.emojis.some(e => e.name == args[1]))) {
                        if (args[1].length > 32 || args[1].length < 2) {
                            message.channel.send(':x: Emoji name must be bewtween 2 and 32 characters.');
                            return;
                        }
                        if (!args[2]) {
                            if (message.attachments.size > 0) {
                                args[2] = message.attachments.first().url;
                            } else {
                                message.channel.send(':x: Please provide an emoji to add.');
                                return;
                            }
                        }
                        try {
                            await guild.createEmoji(args[2], args[1]);
                            const createdEmoji = await guild.emojis.find(e => e.name == args[1]);
                            message.channel.send(`:white_check_mark: Emoji ${createdEmoji} created successfully.`);
                        } catch (e) {
                            message.channel.send(`:x: An error occured. The file size might be too large or you have exceeded the guild's emoji slot limit.`);
                        }
                    } else {
                        message.channel.send(`:x: An emoji with that name already exists.`);
                    }
                } else if (args[0].toLowerCase() === `remove` && args.length == 2) {
                    var emojiID = functionsFile.parseEmojiTag(client, guild, args[1]);
                    var emoji = await guild.emojis.get(emojiID);
                    if (emoji) {
                        guild.deleteEmoji(emoji);
                        message.channel.send(`:white_check_mark: Emoji \`${emoji.name}\` deleted successfully.`);
                    } else message.channel.send(`:x: Emoji not found.`);
                } else if (args[0].toLowerCase() == 'rename') {
                    if (args.length == 3) {
                        var emojiID = functionsFile.parseEmojiTag(client, guild, args[1]);
                        var emoji = guild.emojis.get(emojiID);
                        if (emoji) {
                            var currentName = emoji.name;
                            if (args[2].length > 1 && args[2].length < 33 && !args[2].includes('.')) {
                                if ((emoji.name) != args[2]) {
                                    emoji.setName(`${args[2]}`).then(e => {
                                        message.channel.send(`Name of ${e} successfully changed from \`${currentName}\` to \`${e.name}\``).catch(console.error);
                                    }).catch(console.error);
                                } else message.channel.send(':x: The given name matches the current name.').catch(console.error);
                            } else message.channel.send(':x: Name must be between 2 and 32 characters and cannot include any `.` characters.').catch(console.error);
                        } else message.channel.send(':x: I could not find that emoji.').catch(console.error);
                    } else functionsFile.syntaxErr(client, message, 'emoji rename');
                } else if (args[0].toLowerCase() === `list`) {

                    var sent = false;

                    var listOfEmojis = '';
                    var listOfNames = '';

                    var listOfAnimatedEmojis = '';
                    var listOfAnimatedNames = '';

                    guild.emojis.forEach(e => {
                        if (e.animated) {
                            listOfAnimatedEmojis += `${e}\n`;
                            listOfAnimatedNames += `${e.name}\n`;
                        } else {
                            listOfEmojis += `${e}\n`;
                            listOfNames += `${e.name}\n`
                        }
                        if (listOfNames.length > 980) {
                            message.channel.send({
                                embed: {
                                    color: config.color_info,
                                    fields: [
                                        {
                                            name: 'Emoji',
                                            value: `${listOfEmojis}`,
                                            inline: true
                                        },
                                        {
                                            name: 'Name',
                                            value: `${listOfNames}`,
                                            inline: true
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
                            sent = true;
                            listOfEmojis = '';
                            listOfNames = '';
                        } if (listOfAnimatedNames.length > 980) {
                            message.channel.send({
                                embed: {
                                    color: config.color_info,
                                    fields: [
                                        {
                                            name: 'Animated emoji',
                                            value: `${listOfAnimatedEmojis}`,
                                            inline: true
                                        },
                                        {
                                            name: 'Name',
                                            value: `${listOfAnimatedNames}`,
                                            inline: true
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
                            sent = true;
                            listOfAnimatedEmojis = '';
                            listOfAnimatedNames = '';
                        }
                    });
                    if (listOfEmojis.length > 0) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                fields: [
                                    {
                                        name: 'Emoji',
                                        value: `${listOfEmojis}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Name',
                                        value: `${listOfNames}`,
                                        inline: true
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                        sent = true;
                    } if (listOfAnimatedNames.length > 0) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                fields: [
                                    {
                                        name: 'Animated emoji',
                                        value: `${listOfAnimatedEmojis}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Name',
                                        value: `${listOfAnimatedNames}`,
                                        inline: true
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                        sent = true;
                    } if (!sent) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                title: 'No emojis found',
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                    }
                }
            } else message.channel.send(`:x: Wrong command syntax. Please use \`${config.prefix}help\` to view all commands.`);
        }
    }
}