module.exports = (client, oldMember, newMember) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const channelsFile = client.channelsFile;
    if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES')) {
        var data = [];
        if (oldMember.voiceChannel) {
            if (newMember.voiceChannel) {
                if (oldMember.voiceChannel.id !== newMember.voiceChannel.id) {
                    data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, oldMember.voiceChannel.id, oldMember.voiceChannel.name, 2, new Date()];
                } else {
                    return;
                }
            } else {
                data = [newMember.id, '', '', oldMember.voiceChannel.id, oldMember.voiceChannel.name, 3, new Date()];
            }
        } else {
            if (newMember.voiceChannel) {
                data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, '', '', 1, new Date()];
            } else {
                data = [newMember.id, 'UNKNOWN', 'UNKNOWN', '', '', 1, new Date()];
            }
        }
        if (data.length > 0) {
            connection.query('INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)', data,
                function (err, results) {
                    if (err) throw err;

                    if (channelsFile.get('voice_log')) {
                        if (!oldMember.guild.channels.get(channelsFile.get('voice_log'))) {
                            channelsFile.set('voice_log', '');
                            channelsFile.save();
                            return;
                        }
                        if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES_LOG')) {
                            var voiceLogChannel = newMember.guild.channels.get(channelsFile.get('voice_log'));
                            if (voiceLogChannel.members.has(newMember.id)) {
                                switch (data[5]) { //Switch on the type
                                    case 1: //join
                                        voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>** | ${data[6].toUTCString()}`);
                                        break;
                                    case 2: //move
                                        voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>**, moving from **<#${data[3]}>** | ${data[6].toUTCString()}`);
                                        break;
                                }
                            }
                            else {
                                switch (data[5]) { //Switch on the type
                                    case 1: //join
                                        voiceLogChannel.send(`<@${data[0]}> has joined **<#${data[1]}>** | ${data[6].toUTCString()}`);
                                        break;
                                    case 2: //move
                                        voiceLogChannel.send(`<@${data[0]}> has joined **<#${data[1]}>**, moving from **<#${data[3]}>** | ${data[6].toUTCString()}`);
                                        break;
                                }
                            }
                        }
                    }
                }
            );
        }
    }
}