exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;

    if (message.member.roles.some(r => r.name == 'Moderators')) {
        if (modulesFile.get('COMMAND_EDIT')) {
            if (args.length > 2) {
                var chID = functionsFile.parseChannelTag(client, message.guild, args[0]);
                var chnl = message.guild.channels.get(chID);
                if (chnl) {
                    chnl.fetchMessage(args[1]).then(m => {
                        if (m.author = client.user) {
                            if (m.embeds.length > 0 && m.content.length == 0) {
                                m.edit({
                                    embed: {
                                        title: m.embeds[0].title,
                                        description: `${args.slice(2).join(' ')}`,
                                        color: m.embeds[0].color,
                                        timestamp: m.embeds[0].timestamp,
                                        footer: {
                                            text: m.embeds[0].footer.text
                                        }
                                    }
                                }).catch(console.error);
                                message.channel.send(`:white_check_mark: Message in ${chnl} edited successfully.`).catch(console.error);
                            } else if (m.content.length > 0) {
                                m.edit(`${args.slice(2).join(' ')}`).catch(console.error);
                                message.channel.send(`:white_check_mark: Message in ${chnl} edited successfully.`).catch(console.error);
                            }
                        } else message.channel.send(':x: I am not the author of that message.').catch(console.error);
                    }).catch((err) => {
                        if (err.code == 50035) message.channel.send(':x: I could not find that message.').catch(console.error);
                        else console.log(err);
                    });
                } else message.channel.send(`:x: I could not find that channel. Try using the ID.`).catch(console.error);
            } else functionsFile.syntaxErr(client, message, 'edit');
        } else message.channel.send(':x: That module is disabled.').catch(console.error);
    }
}