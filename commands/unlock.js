exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const LFGRoomsFile = client.LFGRoomsFile;
    const config = client.config;
    const _ = client.underscore;
    const guild = message.guild;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
            if (args.length > 0) var dsc = `${args.join(' ').charAt(0).toUpperCase()}${args.join(' ').slice(1)}`
            else var dsc = '';
            var everyone = guild.roles.find(role => role.name === '@everyone');
            var LFGRoomsObject = LFGRoomsFile.read();
            for (key in LFGRoomsObject) {
                var channelObj = guild.channels.get(key);
                if (channelObj) {
                    if (!channelObj.permissionsFor(everyone).has('SEND_MESSAGES')) {
                        await channelObj.overwritePermissions(everyone, {
                                    SEND_MESSAGES: null
                                },'Servers are back up from the update').then(channel => {
                                    channel.send({
                                        embed: {
                                            color: config.color_info,
                                            title: 'Channel unlocked',
                                            description: dsc,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                    message.channel.send(`Channel ${channel} successfully unlocked`);
                                }
                            ).catch(console.error);
                    } else message.channel.send(`Channel ${channelObj} is not locked.`);
                } else {
                    message.channel.send(`Channel ${key} could not be found/resolved and will be removed from the list.`);
                    LFGRoomsFile.unset(key);
                    LFGRoomsFile.save();
                }
            }
        } else message.channel.send(`:x: That module is disabled.`).catch(console.error);
    }
}