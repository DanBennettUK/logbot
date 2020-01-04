exports.run = async (client, message, args) => {
    const reactionsFile = client.reactionsFile
    const functionsFile = client.functionsFile;
    const _ = client.underscore;
    const config = client.config;
    if (message.member.roles.some(r => r.name == 'Moderators')) {
        if (args.length > 0) {
            if (args[0].toLowerCase() == 'add') {
                if (args.length < 5) {
                    functionsFile.syntaxErr(client, message, 'reactions add');
                    return;
                }
                const chnl = functionsFile.parseChannelTag(client, message.guild, args[1]);
                if (chnl != 'err') {
                    const channl = client.channels.get(chnl);
                    if (channl) {
                        let msg = null;
                        try {
                            msg = await channl.fetchMessage(args[2]);
                        } catch (e) {}
                        if (msg && msg != null) {
                            const emojiID = functionsFile.parseEmojiTag(client, message.guild, args[3]);
                            if (emojiID != 'err') {
                                let emoji = emojiID;
                                if (/[0-9]+/.test(emojiID)) emoji = client.emojis.get(emojiID);
                                if (emoji) {
                                    const roleID = functionsFile.parseRoleTag(client, message.guild, args[4]);
                                    if (roleID != 'err') {
                                        const role = message.guild.roles.get(roleID);
                                        if (role) {
                                            reactionsFile.set(`${chnl}.${args[2]}.${emojiID}`, roleID);
                                            reactionsFile.save();
                                            await msg.react(emoji).catch(console.error);
                                            message.channel.send({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: client.user.username,
                                                        icon_url: client.user.displayAvatarURL
                                                    },
                                                    title: 'Reaction successfully set',
                                                    fields: [
                                                        {
                                                            name: 'Reaction => Role',
                                                            value: `${emoji} => ${role}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: 'Channel => Message',
                                                            value: `${channl} => [Message](${msg.url})`,
                                                            inline: true
                                                        }
                                                    ],
                                                    timestamp: Date.now(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    } else {
                                        message.channel.send(':x: An invalid role was provided.');
                                    }
                                } else {
                                    message.channel.send(':x: An invalid emoji was provided.');
                                }
                            } else {
                                message.channel.send(':x: An invalid emoji was provided.');
                            }
                        } else {
                            message.channel.send(':x: An invalid message ID was provided.');
                        }
                    } else {
                        message.channel.send(':x: An invalid channel was provided.');
                    }
                } else {
                    message.channel.send(':x: An invalid channel was provided.');
                }
            } else if (args[0].toLowerCase() == 'remove') {
                const chnlKeys = _.keys(reactionsFile.read());
                if (args[1]) {
                    let chnl = funstionsFile.parseChannelTag(args[1]);
                    const channl = client.channels.get(chnl);
                    if (!channl) chnl = 'err';
                    if (chnl != 'err') {
                        if (chnlKeys.length > 0 && chnlKeys.includes(chnl)) {
                            if (!args[2]) {
                                reactionsFile.unset(`${chnl}`);
                                reactionsFile.save();
                                message.channel.send({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: client.user.username,
                                            icon_url: client.user.displayAvatarURL
                                        },
                                        title: 'All reactions in the channel have been unset',
                                        fields: [
                                            {
                                                name: 'Channel',
                                                value: `${channl}`
                                            }
                                        ],
                                        timestamp: Date.now(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                            } else {
                                let msg = null;
                                try {
                                    msg = chnl.fetchMessage(args[2]);
                                } catch (e) {}
                                if (msg && msg != null) {
                                    const msgKeys = _.keys(reactionsFile.get(`${chnl}`));
                                    if (msgKeys.length > 0 && msgKeys.includes(args[2])) {
                                        if (!args[3]) {
                                            reactionsFile.unset(`${chnl}.${args[2]}`);
                                            reactionsFile.save();
                                            message.channel.send({
                                                embed: {
                                                    color: config.color_info,
                                                    author: {
                                                        name: client.user.username,
                                                        icon_url: client.user.displayAvatarURL
                                                    },
                                                    title: 'All reactions on the message have been unset',
                                                    fields: [
                                                        {
                                                            name: 'Channel',
                                                            value: `${channl}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: 'Message',
                                                            value: `[Message](${msg.url})`,
                                                            inline: true
                                                        }
                                                    ],
                                                    timestamp: Date.now(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                                    }
                                                }
                                            }).catch(console.error);
                                        } else {
                                            const emojiID = functionsFile.parseEmojiTag(client, message.guild, args[3]);
                                            if (emojiID != 'err') {
                                                let emoji = emojiID;
                                                if (/[0-9]+/.test(emojiID)) emoji = client.emojis.get(emojiID);
                                                if (emoji) {
                                                    const emojiKeys = _.keys(reactionsFile.get(`${chnl}.${args[2]}`));
                                                    if (emojiKeys.length > 0 && emojiKeys.includes(emo[2])) {
                                                        reactionsFile.unset(`${chnl}.${args[2]}.${emo[2]}`);
                                                        reactionsFile.save();
                                                        message.channel.send({
                                                            embed: {
                                                                color: config.color_info,
                                                                author: {
                                                                    name: client.user.username,
                                                                    icon_url: client.user.displayAvatarURL
                                                                },
                                                                title: 'Reaction successfully unset',
                                                                fields: [
                                                                    {
                                                                        name: 'Reaction',
                                                                        value: `${emoji}`,
                                                                        inline: true
                                                                    },
                                                                    {
                                                                        name: 'Channel => Message',
                                                                        value: `${channl} => [Message](${msg.url})`,
                                                                        inline: true
                                                                    }
                                                                ],
                                                                timestamp: Date.now(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                                                }
                                                            }
                                                        }).catch(console.error);
                                                    } else {
                                                        message.channel.send(`${emoji} is not set.`);
                                                    }
                                                } else {
                                                    message.channel.send(':x: An invalid emoji was provided.');
                                                }
                                            } else {
                                                message.channel.send(':x: An invalid emoji was provided.');
                                            }
                                        }
                                    } else {
                                        message.channel.send(`No reaction is set on the message provided.`);
                                    }
                                } else {
                                    message.channel.send('An invalid message ID was provided.');
                                }
                            }
                        } else {
                            message.channel.send(`No reaction is set in channel ${client.channels.get(chnl)}`);
                        }
                    } else {
                        message.channel.send('An invalid channel was provided.');
                    }
                } else {
                    message.channel.send('Are you sure you want to unset all reactions in all channels?').then(async m => {
                        const filter = (reaction, user) => !user.bot;
                        const collector = m.createReactionCollector(filter);
                        await m.react('✅').catch(console.error);
                        await m.react('❌').catch(console.error);
                        collector.on('collect', r => {
                            if (r.emoji.name == '✅') {
                                m.delete();
                                const reactObject = reactionsFile.read();
                                for (key in reactObject){
                                    reactionsFile.unset(key);
                                    reactionsFile.save();
                                }
                                message.channel.send('All reactions have been unset.');
                            } else if (r.emoji.name == '❌') {
                                m.delete();
                                message.channel.send('Action cancelled.');
                            }
                        });
                    });
                }
            } else if (args[0].toLowerCase() == 'list') {
                const reactionsObject = reactionsFile.read();
                let dsc = '';
                let amount = 0;
                let sent = false;
                for (cKey in reactionsObject) {
                    const chnls = reactionsObject[cKey];
                    var chnl = client.channels.get(cKey);
                    if (chnl) {
                        for (mKey in chnls) {
                            const msgs = chnls[mKey];
                            let msg = null;
                            try {
                                msg = await chnl.fetchMessage(mKey);
                            } catch (e) {}
                            if (msg && msg != null) {
                                for (rKey in msgs) {
                                    let emoji = rKey;
                                    if (/[0-9]+/.test(rKey)) emoji = client.emojis.get(rKey);
                                    if (emoji) {
                                        const roleID = msgs[rKey];
                                        const role = message.guild.roles.find(r => r.id == roleID);
                                        if (role) {
                                            if (dsc.length > 1900) {
                                                let plural = 'reactions';
                                                if (amount == 1) plural = 'reaction';
                                                message.channel.send({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: client.user.username,
                                                            icon_url: client.user.displayAvatarURL
                                                        },
                                                        title: `Showing ${amount} set ${plural}:`,
                                                        description: dsc,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                                        }
                                                    }
                                                }).catch(console.error);
                                                dsc = '';
                                                amount = 0;
                                                sent = true;
                                            }
                                            dsc += `${emoji} reaction for role ${role} set on [this message](${msg.url}) in ${chnl}\n`;
                                            amount ++;
                                        } else {
                                            dsc += `${emoji} reaction for role **INVALID ROLE** (${roleID}) set on [this message](${msg.url}) in ${chnl}\n`;
                                            amount ++;
                                            //reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                                            //reactionsFile.save();
                                        }
                                    } else {
                                        dsc += `**INVALID EMOJI** (${rKey}) reaction for **UNKNOWN ROLE** set on [this message](${msg.url}) in ${chnl}\n`;
                                        amount ++;
                                        //reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                                        //reactionsFile.save();
                                    }
                                }
                            } else {
                                dsc += `**UNKNOWN EMOJI** reaction for **UNKNOWN ROLE** set on **INVALID MESSAGE** (${mKey}) in ${chnl}\n`;
                                amount ++;
                                //reactionsFile.unset(`${cKey}.${mKey}`);
                                //reactionsFile.save();
                            }
                        }
                    } else {
                        dsc += `**UNKNOWN EMOJI** reaction for **UNKNOWN ROLE** set on **UNKNOWN MESSAGE** in **INVALID CHANNEL** (${cKey})\n`;
                        amount ++;
                        //reactionsFile.unset(`${cKey}`);
                        //reactionsFile.save();
                    }
                }
                if (dsc.length > 0) {
                    let plural = 'reactions';
                    if (amount == 1) plural = 'reaction';
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: `Showing ${amount} set ${plural}:`,
                            description: dsc,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                } else if (dsc.length == 0 && !sent) {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: 'There are no reactions set',
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                }
            } else if (args[0].toLowerCase() == 'reset') {
                functionsFile.setReactionRoles(client);
                message.channel.send(':white_check_mark: reactions reset.');
            }
        }
    }
}