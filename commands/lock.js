exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const LFGRoomsFile = client.LFGRoomsFile;
    const _ = client.underscore;
    const guild = message.guild;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
            let dsc;
            if (args.length > 0) dsc = `${args.join(' ').charAt(0).toUpperCase()}${args.join(' ').slice(1)}`
            else dsc = '';
            const everyone = guild.roles.find( role => role.name === '@everyone');
            const LFGRoomsObject = LFGRoomsFile.read();
            for (key in LFGRoomsObject) {
                const channelObj = guild.channels.get(key);
                if (channelObj) {
                    if (channelObj.permissionsFor(everyone).has('SEND_MESSAGES')) {
                        await channelObj.overwritePermissions(everyone, {
                                    SEND_MESSAGES: false
                                }, 'Servers are down for the update').then(channel => {
                                    channel.send({
                                        embed: {
                                            color: config.color_info,
                                            title: 'Channel locked',
                                            description: dsc,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                    message.channel.send(`Channel ${channel} successfully locked`);
                                }
                            ).catch(console.error);
                    } else message.channel.send(`Channel ${channelObj} is already locked.`).catch(console.error);
                } else {
                    message.channel.send(`Channel ${key} could not be found/resolved and will be removed from the list.`).catch(console.error);
                    LFGRoomsFile.unset(key);
                    LFGRoomsFile.save();
                }
            }
        } else message.channel.send(`:x: That module is disabled.`).catch(console.error);
    }
}