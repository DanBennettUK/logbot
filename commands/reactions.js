exports.run = async (client, message, args) => {
    const reactionsFile = client.reactionsFile
    const functionsFile = client.functionsFile;
    const _ = client.underscore;
    const config = client.config;
    if (message.member.roles.some(r => r.name == 'Moderators')) {
        if (args) {
            if (args[0].toLowerCase() == 'add') {
                if (args.length < 5) {
                    functionsFile.syntaxErr(client, message, 'reactions add');
                    return;
                }
                var chnl = functionsFile.parseChannelTag(client, message.guild, args[1]);
                if (chnl != 'err') {
                    var channl = client.channels.get(chnl);
                    if (channl) {
                        try {
                            var msg = await channl.fetchMessage(args[2]);
                        } catch (e) {}
                        if (msg) {
                            if (/^<a?:[a-z0-9]+:[0-9]+>$/i.test(args[3])) {
                                var emo = args[3].replace(/<|>/g, '');
                                emo = emo.split(':');
                                var emoji = client.emojis.find(e => e.id == emo[2]);
                                if (emoji) {
                                    if (/[0-9]+/.test(args[4])) {
                                        var role = message.guild.roles.get(args[4]);
                                        if (role) {
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    } else {
                                        var role = message.guild.roles.find(r => r.name == args[4]);
                                        if (role) {
                                            args[4] = role.id;
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    }
                                } else {
                                    message.channel.send(':x: An invalid emoji was provided.');
                                }
                            } else if (/[0-9]+/.test(args[3])) {
                                var emoji = client.emojis.get(args[3]);
                                if (emoji) {
                                    if (/[0-9]+/.test(args[4])) {
                                        var role = message.guild.roles.get(args[4]);
                                        if (role) {
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    } else {
                                        var role = message.guild.roles.find(r => r.name == args[4]);
                                        if (role) {
                                            args[4] = role.id;
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    }
                                } else {
                                    message.channel.send(':x: An invalid emoji was provided.');
                                }
                            } else if (/[a-z0-9]+/i.test(args[3])) {
                                var emoji = client.emojis.find(e => e.name == args[3]);
                                if (emoji) {
                                    args[3] = emoji.id;
                                    if (/[0-9]+/.test(args[4])) {
                                        var role = message.guild.roles.get(args[4]);
                                        if (role) {
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    } else {
                                        var role = message.guild.roles.find(r => r.name == args[4]);
                                        if (role) {
                                            args[4] = role.id;
                                            reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                            reactionsFile.save();
                                            await msg.react(emoji);
                                            message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                        } else {
                                            message.channel.send(':x: An invalid role was provided.');
                                        }
                                    }
                                } else {
                                    message.channel.send(':x: An invalid emoji was provided.');
                                }
                            } else {
                                var emoji = args[3];
                                var role = message.guild.roles.get(args[4]);
                                if (/[0-9]+/.test(args[4])) {
                                    if (role) {
                                        reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                        reactionsFile.save();
                                        await msg.react(emoji);
                                        message.channel.send(`Reaction on [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                    } else {
                                        message.channel.send(':x: An invalid role was provided.');
                                    }
                                } else {
                                    var role = message.guild.roles.find(r => r.name == args[4]);
                                    if (role) {
                                        args[4] = role.id;
                                        reactionsFile.set(`${chnl}.${args[2]}.${args[3]}`, args[4]);
                                        reactionsFile.save();
                                        await msg.react(emoji);
                                        message.channel.send(`Reaction [this message](${msg.url} in ${client.channels.get(chnl)} successfully set!`);
                                    } else {
                                        message.channel.send(':x: An invalid role was provided.');
                                    }
                                }
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
                    var chnl = parseChannelTag(args[1]);
                    var channl = client.channels.get(chnl);
                    if (!channl) chnl = 'err';
                    if (chnl != 'err') {
                        if (chnlKeys.length > 0 && chnlKeys.includes(chnl)) {
                            if (!args[2]) {
                                reactionsFile.unset(`${chnl}`);
                                reactionsFile.save();
                                message.channel.send(`Reactions in channel ${client.channels.get(chnl)} have been unset`);
                            } else {
                                try {
                                    var msg = chnl.fetchMessage(args[2]);
                                } catch (e) {}
                                if (msg) {
                                    const msgKeys = _.keys(reactionsFile.get(`${chnl}`));
                                    if (msgKeys.length > 0 && msgKeys.includes(args[2])) {
                                        if (!args[3]) {
                                            reactionsFile.unset(`${chnl}.${args[2]}`);
                                            reactionsFile.save();
                                            message.channel.send(`Reactions on [this message](${msg.url} in channel ${client.channels.get(chnl)} have been unset`);
                                        } else {
                                            if (/^<a?:[a-z0-9]+:[0-9]+>$/i.test(args[3])) {
                                                var emo = args[3].replace(/<|>/g, '');
                                                emo = emo.split(':');
                                                var emoji = client.emojis.fine(e => e.id == emo[2]);
                                                if (emoji) {
                                                    const emojiKeys = _.keys(reactionsFile.get(`${chnl}.${args[2]}`));
                                                    if (emojiKeys.length > 0 && emojiKeys.includes(emo[2])) {
                                                        reactionsFile.unset(`${chnl}.${args[2]}.${emo[2]}`);
                                                        reactionsFile.save();
                                                        message.channel.send(`${emoji} reaction on [this message](${msg.url} in channel ${client.channels.get(chnl)} has been unset`);
                                                    } else {
                                                        message.channel.send(`${emoji} is not set.`);
                                                    }
                                                } else {
                                                    message.channel.send(':x: An invalid emoji was provided.');
                                                }
                                            } else if (/[0-9]+/.test(args[3])) {
                                                var emoji = client.emojis.fine(e => e.id == args[3]);
                                                if (emoji) {
                                                    const emojiKeys = _.keys(reactionsFile.get(`${chnl}.${args[2]}`));
                                                    if (emojiKeys.length > 0 && emojiKeys.includes(args[3])) {
                                                        reactionsFile.unset(`${chnl}.${args[2]}.${args[3]}`);
                                                        reactionsFile.save();
                                                        message.channel.send(`${emoji} reaction on [this message](${msg.url} in channel ${client.channels.get(chnl)} has been unset`);
                                                    } else {
                                                        message.channel.send(`${emoji} is not set.`);
                                                    }
                                                } else {
                                                    message.channel.send(':x: An invalid emoji was provided.');
                                                }
                                            } else if (/[a-z0-9]+/gi.test(args[3])) {
                                                var emoji = client.emojis.find(e => e.name == args[3]);
                                                if (emoji) {
                                                    args[3] = emoji.id;
                                                    const emojiKeys = _.keys(reactionsFile.get(`${chnl}.${args[2]}`));
                                                    if (emojiKeys.length > 0 && emojiKeys.includes(args[3])) {
                                                        reactionsFile.unset(`${chnl}.${args[2]}.${args[3]}`);
                                                        reactionsFile.save();
                                                        message.channel.send(`${emoji} reaction on [this message](${msg.url} in channel ${client.channels.get(chnl)} has been unset`);
                                                    } else {
                                                        message.channel.send(`${emoji} is not set.`);
                                                    }
                                                } else {
                                                    message.channel.send(':x: An invalid emoji was provided.');
                                                }
                                            } else {
                                                const emojiKeys = _.keys(reactionsFile.get(`${chnl}.${args[2]}`));
                                                if (emojiKeys.length > 0 && emojiKeys.includes(args[3])) {
                                                    reactionsFile.unset(`${chnl}.${args[2]}.${args[3]}`);
                                                    reactionsFile.save();
                                                    message.channel.send(`${emoji} reaction on [this message](${msg.url} in channel ${client.channels.get(chnl)} has been unset`);
                                                } else {
                                                    message.channel.send(`${emoji} is not set.`);
                                                }
                                            }
                                        }
                                    } else {
                                        message.channel.send(`No reaction is set on [this message](${msg.url}`);
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
                        const filter = (rection, user) => !user.bot;
                        const collector = m.createReactionCollector(filter);
                        collector.on('collect', r =>{
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
                        await m.react('✅');
                        await m.react('❌');
                    });
                }
            } else if (args[0].toLowerCase() == 'list') {
                const reactionsObject = reactionsFile.read();
                var dsc = '';
                var amount = 0;
                var sent = false;
                for (cKey in reactionsObject) {
                    const chnls = reactionsObject[cKey];
                    var chnl = client.channels.get(cKey);
                    if (chnl) {
                        for (mKey in chnls) {
                            const msgs = chnls[mKey];
                            try {
                                var msg = await chnl.fetchMessage(mKey);
                            } catch (e) {}
                            if (msg) {
                                for (rKey in msgs) {
                                    if (/[0-9]+/.test(rKey)) var emoji = client.emojis.find(e => e.id == rKey);
                                    else var emoji = rKey;
                                    if (emoji) {
                                        const roleID = msgs[rKey];
                                        var role = message.guild.roles.find(r => r.id == roleID);
                                        if (role) {
                                            if (dsc.length > 1900) {
                                                if (amount == 1) {
                                                    var plural = 'reaction';
                                                } else var plural = 'reactions';
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
                                            dsc += `${emoji} reaction for role ${role} set on [this message](${msg.url})\n`;
                                            amount ++;
                                        } else {
                                            reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                                            reactionsFile.save();
                                        }
                                    } else {
                                        reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                                        reactionsFile.save();
                                    }
                                }
                            } else {
                                reactionsFile.unset(`${cKey}.${mKey}`);
                                reactionsFile.save();
                            }
                        }
                    } else {
                        reactionsFile.unset(`${cKey}`);
                        reactionsFile.save();
                    }
                }
                if (dsc.length > 0) {
                    if (amount == 1) {
                        var plural = 'reaction';
                    } else var plural = 'reactions';
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
                                icon_url: client.user.displazAvatarURL
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