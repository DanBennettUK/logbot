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
                } else if (args[0].toLowerCase() === `list`) {

                    var sent = false;
    
                    var listOfEmojis = '';
                    var listOfNames = '';

                    guild.emojis.forEach(e => {
                        listOfEmojis += `${e}\n`;
                        listOfNames += `${e.name}\n`
                        if (listOfNames.length > 1000) {
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
                            });
                            sent = true;
                            listOfEmojis = '';
                            listOfNames = '';
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
                        });
                    } else if (!sent) {
                        message.channel.send({
                            embed: {
                                color: config.color_info,
                                title: 'No emojis found',
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    }
                }
            } else message.channel.send(`:x: Wrong command syntax. Please use \`${config.prefix}help\` to view all commands.`);
        }
    }
}