module.exports = (client, oldMember, newMember) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const channelsFile = client.channelsFile;
    const functionsFile = client.functionsFile;
    if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES')) {
        var data = [];
        if (oldMember.voiceChannel) {
            if (newMember.voiceChannel) {
                if (oldMember.voiceChannel.id !== newMember.voiceChannel.id) {
                    data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, oldMember.voiceChannel.id, oldMember.voiceChannel.name, 2, new Date()];
                    if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES_LOG')) {
                        if (channelsFile.get('voice_log')) {
                            if (oldMember.guild.channels.get(channelsFile.get('voice_log'))) {
                                var voiceLogChannel = newMember.guild.channels.get(channelsFile.get('voice_log'));
                                if (voiceLogChannel.members.has(newMember.id)) {
                                        voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>**, moving from **<#${data[3]}>** | ${data[6].toUTCString()}`);
                                    } else {
                                        voiceLogChannel.send(`<@${data[0]}> has joined **<#${data[1]}>**, moving from **<#${data[3]}>** | ${data[6].toUTCString()}`);
                                }
                            }
                        }
                    }
                }
            } else {
                data = [newMember.id, '', '', oldMember.voiceChannel.id, oldMember.voiceChannel.name, 3, new Date()];
            }
        } else {
            if (newMember.voiceChannel) {
                data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, '', '', 1, new Date()];
                if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES_LOG')) {
                    if (channelsFile.get('voice_log')) {
                        if (oldMember.guild.channels.get(channelsFile.get('voice_log'))) {
                            var voiceLogChannel = newMember.guild.channels.get(channelsFile.get('voice_log'));
                            if (voiceLogChannel.members.has(newMember.id)) {
                                voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>** | ${data[6].toUTCString()}`);
                            } else {
                                voiceLogChannel.send(`<@${data[0]}> has joined **<#${data[1]}>** | ${data[6].toUTCString()}`);
                            }
                        }
                    }
                }
            } else {
                data = [newMember.id, 'UNKNOWN', 'UNKNOWN', '', '', 1, new Date()];
            }
        }
        if (data.length > 0) {
            connection.query('INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)', data,
                function (err, results) {
                    if (err) {
                        connection = functionsFile.establishConnection(client);
                        connection.query('INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)', data,
                        function (err, results) {
                            if (err) throw err;
                        });
                    }
                }
            );
        }
    }
}