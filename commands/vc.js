exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => role.name === 'Moderators')) {
        if (modulesFile.get('COMMAND_VC')) {
<<<<<<< HEAD
            if (args.length > 0) {
=======
            if (args) {
>>>>>>> 6d5d44aedeec27de64f20bf3f3b835254a64b704
                var user = functionsFile.parseUserTag(client, message.guild, args.join(' '));
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