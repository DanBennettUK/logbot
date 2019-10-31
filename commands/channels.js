exports.run = (client, message, args) => {
    const channelsFile = client.channelsFile;
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;

    if (message.member.roles.some(role => role.name == 'Moderators')) {
        if(modulesFile.get('COMMAND_CHANNEL')) {
            if (args[0]) {
                if (args.length > 1) {
                    if (args[0].toLowerCase() == 'set') {
                        if (!args[2]) {
                            message.channel.send(`This channel will be set as ${args[1].toLowerCase()}. Do you wish to proceed?`).then(async msg => {
                                await msg.react('✅');
                                await msg.react('❌');
                                const filter = (reaction, user) => !user.bot;
                                const collector = msg.createReactionCollector(filter);
                                collector.on('collect', r => {
                                    if (r.emoji.name == '✅') {
                                        msg.delete();
                                        if (args[1].toLowerCase() == 'server_log') {
                                            channelsFile.set('server_log', message.channel.id);
                                            channelsFile.save();
                                            message.channel.send(':white_check_mark: Server log successfully set');
                                        } else if (args[1].toLowerCase() == 'action_log') {
                                            channelsFile.set('action_log', message.channel.id);
                                            channelsFile.save();
                                            message.channel.send(':white_check_mark: Action log successfully set');
                                        } else if (args[1].toLowerCase() == 'voice_log') {
                                            channelsFile.set('voice_log', message.channel.id);
                                            channelsFile.save();
                                            message.channel.send(':white_check_mark: Voice log successfully set');
                                        } else if (args[1].toLowerCase() == 'all') {
                                            channelsFile.set('server_log', message.channel.id);
                                            channelsFile.set('action_log', message.channel.id);
                                            channelsFile.set('voice_log', message.channel.id);
                                            channelsFile.save();
                                            message.channel.send(':white_check_mark: All logs successfully set');
                                        } else functionsFile.syntaxErr(client, message, 'commands set');
                                    } else if (r.emoji.name == '❌') {
                                        msg.delete();
                                        message.channel.send('Action cancelled.').then(msg2 => {
                                            setTimeout(msg2.delete(), 7000);
                                        });
                                    }
                                });
                            });
                        } else {
                            if (args[1].toLowerCase() == 'server_log') {
                                var channel = functionsFile.parseChannelTag(client, message.guild, args[2]);
                                if (client.channels.get(channel)) {
                                    channelsFile.set('server_log', channel);
                                    channelsFile.save();
                                    message.channel.send(':white_check_mark: Server log successfully set');
                                } else message.channel.send(':x: An invalid channel was provided.');
                            } else if (args[1].toLowerCase() == 'action_log') {
                                var channel = functionsFile.parseChannelTag(client, message.guild, args[2]);
                                if (client.channels.get(channel)) {
                                    channelsFile.set('action_log', channel);
                                    channelsFile.save();
                                    message.channel.send(':white_check_mark: Action log successfully set');
                                } else message.channel.send(':x: An invalid channel was provided.');
                            } else if (args[1].toLowerCase() == 'voice_log') {
                                var channel = functionsFile.parseChannelTag(client, message.guild, args[2]);
                                if (client.channels.get(channel)) {
                                    channelsFile.set('voice_log', channel);
                                    channelsFile.save();
                                    message.channel.send(':white_check_mark: Voice log successfully set');
                                } else message.channel.send(':x: An invalid channel was provided.');
                            } else if (args[1].toLowerCase() == 'all') {
                                var channel = functionsFile.parseChannelTag(client, message.guild, args[2]);
                                if (client.channels.get(channel)) {
                                    channelsFile.set('server_log', channel);
                                    channelsFile.set('action_log', channel);
                                    channelsFile.set('voice_log', channel);
                                    channelsFile.save();
                                    message.channel.send(':white_check_mark: All logs successfully set');
                                } else message.channel.send(':x: An invalid channel was provided.');
                            } else functionsFile.syntaxErr(client, message, 'channels set');
                        }
                    } else if (args[0].toLowerCase() == 'unset') {
                        if (args[1].toLowerCase() == 'server_log') {
                            if (channelsFile.get('server_log')) {
                            channelsFile.set('server_log', '');
                            channelsFile.save();
                            message.channel.send(':white_check_mark: Server log successfully unset');
                            } else message.channel.send(':x: Server log is not set')
                        } else if (args[1].toLowerCase() == 'action_log') {
                            if (channelsFile.get('action_log')) {
                                channelsFile.set('action_log', '');
                                channelsFile.save();
                                message.channel.send(':white_check_mark: Action log successfully unset');
                                } else message.channel.send(':x: Action log is not set');
                        } else if (args[1].toLowerCase() == 'voice_log') {
                            if (channelsFile.get('voice_log')) {
                                channelsFile.set('voice_log', '');
                                channelsFile.save();
                                message.channel.send(':white_check_mark: Voice log successfully unset');
                            } else message.channel.send(':x: Voice log is not set');
                        } else if (args[1].toLowerCase() == 'all') {
                            channelsFile.set('server_log', '');
                            channelsFile.set('action_log', '');
                            channelsFile.set('voice_log', '');
                            channelsFile.save();
                            message.channel.send(':white_check_mark: All logs successfully unset');
                        } else functionsFile.syntaxErr(client, message, 'channels unset');
                    }
                } else if (args[0] && args[0].toLowerCase() == 'list') {
                    var channels = '';
                    var types = '';
                    var channelsObj = channelsFile.read();
                    for (type in channelsObj) {
                        types += `${type}\n`;
                        if (channelsObj[type]) {
                            if (message.guild.channels.get(channelsObj[type])) {
                                channels += `${message.guild.channels.get(channelsObj[type])}\n`;
                            } else {
                                channelsFile.set(type, '');
                                channelsFile.save();
                                channels += 'Not set\n';
                            }
                        } else {
                            channels += 'Not set\n';
                        }
                    }
                    message.channel.send({
                        embed: {
                            color: client.config.color_info,
                            title: 'Listing logging channels',
                            fields: [
                            {
                                name: 'Log type',
                                value: `${types}`,
                                inline: true
                            },
                            {
                                name: 'Channel',
                                value: `${channels}`,
                                inline: true
                            }
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${client.config.version}`
                            }
                        }
                    });
                }
            }
        } else message.channel.send(`:x: This module is disabled`);
    }
}