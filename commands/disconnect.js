exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const guild = message.guild;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Admins', 'Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_DISCONNECT')) {
<<<<<<< HEAD
            if (args.length > 0) {    
=======
            if (args) {    
>>>>>>> 6d5d44aedeec27de64f20bf3f3b835254a64b704
                var user = functionsFile.parseUserTag(client, guild, args.join(' '));
                var guildUser = guild.member(user);

                if (user !== 'err' && guildUser && guildUser.voiceChannel !== undefined) {
                    guildUser.setVoiceChannel(null).then(member => {
                        message.channel.send(`${member} was successfully removed from their voice channel.`);
                    }).catch(console.error);
                } else {
                    message.channel.send('The user provided was not found or is not in a voice channel.');
                }
            } else functionsFile.syntaxErr(client, message, 'disconnect');
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}