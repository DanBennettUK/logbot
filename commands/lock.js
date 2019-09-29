exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    const LFGRoomsFile = client.LFGRoomsFile;
    const _ = client.underscore;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
            var everyone = guild.roles.find( role => role.name === '@everyone');
            var channels = _.keys(LFGRoomsFile.read());
            for (var i = 0; i < channels.length; i++) {
                var channelObj = guild.channels.find(obj => obj.name == channels[i]);
                if (channelObj) {
                    if (channelObj.permissionsFor(everyone).has('SEND_MESSAGES')) {
                        await channelObj.overwritePermissions(everyone, {
                                    SEND_MESSAGES: false
                                }, 'Servers are down for the update').then(channel => {
                                    channel.send({
                                        embed: {
                                            color: config.color_info,
                                            title: 'Maintenance has begun',
                                            description: 'Channel will be locked until maintenance ends. Keep an eye on <#289467450074988545> for more info.',
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    });
                                    message.channel.send(`Channel ${channel} successfully locked`);
                                }
                            );
                    } else message.channel.send(`Channel ${channelObj} is already locked.`);
                } else message.channel.send(`Channel ${channels[i]} could not be found/resolved.`);
            }
        } else message.channel.send(`That module (${command}) is disabled.`);
    }
}