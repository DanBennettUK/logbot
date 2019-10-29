exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const config = client.config;
    if (message.member.roles.some(role => role.name === 'Moderators')) {
        if (modulesFile.get('COMMAND_VCT')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(client, message.guild, args[0]);
                var guildUser = message.guild.member(user);
                var msg;
                if (user !== 'err' && guildUser) {
                    var vc = guildUser.voiceChannel;
                    if (vc != undefined) {
                        var size = vc.members.size;
                        switch (size) {
                            case 1:
                                await message.channel.send(`User ${guildUser} is in voice channel **${vc.name}**`).then(async m => {
                                    await m.react('🛑').catch(console.error);
                                    msg = m;
                                }).catch(console.error);
                                break;
                            default:
                                await message.channel.send(`User ${guildUser} is in voice channel **${vc.name}** with ${vc.members.size - 1} other users`).then(async m => {
                                    await m.react('🛑').catch(console.error);
                                    msg = m;
                                }).catch(console.error);
                        }
                    } else await message.channel.send(`User ${guildUser} is not in a voice channel`).then(async m => {
                        await m.react('🛑').catch(console.error);
                        msg = m;
                    }).catch(console.error);
                    const checkVC = setInterval(() => {
                        if (guildUser.voiceChannel != vc || (guildUser.voiceChannel && guildUser.voiceChannel.members.size != size)) {
                            vc = guildUser.voiceChannel;
                            if (vc != undefined) {
                                size = vc.members.size;
                                switch (size) {
                                    case 1:
                                        msg.edit(`User ${guildUser} is in voice channel **${vc.name}**`).catch(console.error);
                                        break;
                                    default:
                                        msg.edit(`User ${guildUser} is in voice channel **${vc.name}** with ${vc.members.size - 1} other users`).catch(console.error);
                                }
                            } else msg.edit(`User ${guildUser} is not in a voice channel`).catch(console.error);
                        }
                    }, 1000);
                    const autoStop = setTimeout(()=> {
                        clearInterval(checkVC);
                        msg.clearReactions();
                        msg.edit(`Tracking automatically stopped after 5m. To start again, use \`${config.prefix}vct <user>\` User ${guildUser} was last seen in **${vc.name}**.`);
                    }, 300000);
                    const filter = (reaction, user) => !user.bot
                    const collector = msg.createReactionCollector(filter);
                    collector.on('collect', react => {
                        if (react.emoji.name == '🛑') {
                            clearTimeout(autoStop);
                            clearInterval(checkVC);
                            msg.clearReactions();
                            msg.edit(`Tracking stopped. User ${guildUser} was last seen in **${vc.name}**.`);
                        }
                    });
                } else message.channel.send(':x: Thes user provided was not found');
            } else functionsFile.syntaxErr(client, message, 'vct');
        }
    }
}