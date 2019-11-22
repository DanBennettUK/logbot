module.exports = (client, member) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const config = client.config;
    const functionsFile = client.functionsFile;
    const channelsFile = client.channelsFile;
    if (modulesFile.get('EVENT_GUILD_MEMBER_LEAVE')) {
        var data = [member.user.id, new Date()];
        var userLeave = [0, member.user.id];

        connection.query('INSERT INTO log_guildleave (userID, timestamp) VALUES (?,?)', data,
            function (err, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('INSERT INTO log_guildleave (userID, timestamp) VALUES (?,?)', data,
                    function (err, results) {
                        if (err) throw err;
                    });
                }
            }
        );
        connection.query('UPDATE users SET exist = ? WHERE userID = ?', userLeave,
            function (err, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('UPDATE users SET exist = ? WHERE userID = ?', userLeave,
                    function (err, results) {
                        if (err) throw err;
                    });
                }
            }
        );
        if (channelsFile.get('server_log')) {
            if (!member.guild.channels.get(channelsFile.get('server_log'))) {
                return;
            }
            if (modulesFile.get('EVENT_GUILD_MEMBER_LEAVE_LOG')) {
                member.guild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_warning,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator}`,
                            icon_url: member.user.displayAvatarURL
                        },
                        title: `User left`,
                        description: `User ${member.user} (${member.user.username}#${member.user.discriminator} ${member.user.id}) has left ${member.guild.name}`,
                        thumbnail: {
                            url:member.user.displayAvatarURL
                        },
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            }
        }
    }
}