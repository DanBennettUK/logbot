module.exports = (client, guild, user) => {
    const cryptoRandomString = client.cryptoRandomString;
    const bannedUsersFile = client.bannedUsersFile;
    var connection = client.connection;
    const functionsFile = client.functionsFile;
    const config = client.config;
    const modulesFile = client.modulesFile;
    const channelsFile = client.channelsFile;
    var identifier = cryptoRandomString({ length: 10 });
    bannedUsersFile.set(identifier, user.username);
    bannedUsersFile.save();

    var data = [user.id, '001', 'SYSTEM BAN', identifier, 0, new Date()];
    connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
        function (err, results) {
            if (err) {
                connection = functionsFile.establishConnection(client);
                connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                function (err, results) {
                    if (err) throw err;
                });
            }
        }
    );
    if (channelsFile.get('server_log')) {
        if (!guild.channels.get(channelsFile.get('server_log'))) {
            return;
        }
        if (modulesFile.get('EVENT_GUILD_BAN_ADD_LOG')) {
            guild.channels.get(channelsFile.get('server_log')).send({
                embed: {
                    color: config.color_success,
                    author: {
                        name: `${user.username}#${user.discriminator}`,
                        icon_url: user.displayAvatarURL
                    },
                    title: `User banned`,
                    thumbnail: {
                        url: user.displayAvatarURL
                    },
                    description: `User ${user} (${user.username}#${user.discriminator} ${user.id}) has been banned`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            }).catch(console.error);
        }
    }
}