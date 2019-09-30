exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => role.name === 'Moderators')) {
        if (modulesFile.get('COMMAND_VC')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(client, message.guild, args[0]);
                var guildUser = message.guild.member(user);
                if (user !== 'err' && guildUser) {
                    var vc = guildUser.voiceChannel;
                    if (vc != undefined) {
                        switch (vc.members.size) {
                            case 1:
                                message.channel.send(`User ${guildUser} is in voice channel **${vc.name}**`);
                                break;
                            default:
                                message.channel.send(`User ${guildUser} is in voice channel **${vc.name}** with ${vc.members.size - 1} other users`);
                        }
                    } else message.channel.send(`User ${guildUser} is not in a voice channel`);
                } else message.channel.send('Thes user provided was not found');
            } else functionsFile.syntaxErr(client, message, 'vc');
        }
    }
}