exports.run = (client, message, args) => {
    const functionsFile = client.functionsFile;
    const LFGRoomsFile = client.LFGRoomsFile;
    const _ = client.underscore;
    const config = client.config;
    if (args[0] && args[0].toLowerCase() === 'add') {
        if (!args[1]) {
            message.channel.send('Please provide a channel to add.');
            return;
        }
        var chnlID = functionsFile.parseChannelTag(client, message.guild, args[1].toLowerCase());
        var chnl = message.guild.channels.get(chnlID);
        if (chnl) {
            LFGRoomsFile.set(chnlID, 1);
            LFGRoomsFile.save();
            message.channel.send(`Added ${chnl}`);   
        } else message.channel.send('Channel not found.');
    }
    if (args[0] && args[0].toLowerCase() === 'remove') {
        if (args[1]) {
            var chnlID = functionsFile.parseChannelTag(client, message.guild, args[1].toLowerCase());
            var chnl = message.guild.channels.get(chnlID);
            if (chnl) {
                if (_.keys(LFGRoomsFile.read()).length > 0 && _.keys(LFGRoomsFile.read()).includes(chnlID)) {
                    LFGRoomsFile.unset(chnlID);
                    LFGRoomsFile.save();
                    message.channel.send(`Removed ${chnl}`);
                } else message.channel.send('That channel is not listed.');
            } else message.channel.send('Channel not found.');
        } else {
            message.channel.send('Are you sure you want to remove all LFG rooms?').then(async msg => {
                const filter = (reaction, user) => !user.bot;
                const collector = msg.createReactionCollector(filter);
                collector.on('collect', r => {
                    if (r.emoji.name == '✅') {
                        msg.delete();
                        const LFGRoomsObject = LFGRoomsFile.read();
                        for (key in LFGRoomsObject) {
                            LFGRoomsFile.unset(key);
                            LFGRoomsFile.save();
                        }
                        message.channel.send(':white_check_mark: All LFG channels have been unset');
                    }
                    else if (r.emoji.name == '❌') {
                        m.delete();
                        message.channel.send('Action cancelled.');
                    }
                });
                await msg.react('✅');
                await msg.react('❌');
            });
        }
    }

    if (args[0] && args[0].toLowerCase() == 'list') {
        var dsc = '';
        var LFGRoomsObject = LFGRoomsFile.read();
        for (key in LFGRoomsObject) {
            var chnl = message.guild.channels.get(key);
            if (chnl) {
                dsc += `${chnl} (${key})\n`;
            } else {
                LFGRoomsFile.unset(key);
                LFGRoomsFile.save();
            }
        }

        if (dsc.length > 0) {
            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: 'List of LFG rooms',
                    description: `${dsc}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        } else {
            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: 'There are no set LFG rooms',
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        }
    }
}