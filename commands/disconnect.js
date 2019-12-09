exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const guild = message.guild;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Admins', 'Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_DISCONNECT')) {
            if (args.length > 0) {
                var user = functionsFile.parseUserTag(client, guild, args.join(' '));
                var guildUser = guild.member(user);

                if (user !== 'err' && guildUser && guildUser.voiceChannel !== undefined) {
                    guildUser.setVoiceChannel(null).then(member => {
                        message.channel.send(`${member} was successfully removed from their voice channel.`).catch(console.error);
                    }).catch(console.error);
                } else {
                    message.channel.send('The user provided was not found or is not in a voice channel.').catch(console.error);
                }
            } else functionsFile.syntaxErr(client, message, 'disconnect');
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}