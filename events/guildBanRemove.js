module.exports = (client, guild, user) => {
    const cryptoRandomString = client.cryptoRandomString;
    let connection = client.connection;
    const config = client.config;
    const modulesFile = client.modulesFile;
    const bannedUsersFile = client.bannedUsersFile;
    const functionsFile = client.functionsFile;
    const channelsFile = client.channelsFile;
    const identifier = cryptoRandomString({length: 10});
    const data = [user.id, '001', "SYSTEM UNBAN", identifier, 0, new Date()];
    connection.query('INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
    function(err, results){
        if(err) {
            connection = functionsFile.establishConnection(client);
            connection.query('INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
            function(err, results){
                if(err) throw err;
            });
        }
    });
    connection.query('SELECT identifier FROM log_guildbans WHERE userid = ? ORDER BY timestamp DESC LIMIT 1', user.id,
    function(err, rows, results){
        if (err) {
            connection = functionsFile.establishConnection(client);
            connection.query('SELECT identifier FROM log_guildbans WHERE userid = ? ORDER BY timestamp DESC LIMIT 1', user.id,
            function(err, rows, results){
                if(err) throw err;
                if (rows.length > 0) {
                    bannedUsersFile.set(rows[0].identifier, '');
                    bannedUsersFile.save();
                }
            });
        } else {
            if (rows.length > 0) {
                bannedUsersFile.set(rows[0].identifier, '');
                bannedUsersFile.save();
            }
        }
    });
    if (channelsFile.get('server_log')) {
        if (!guild.channels.get(channelsFile.get('server_log'))) {
            return;
        }
        if (modulesFile.get('EVENT_GUILD_BAN_REMOVE_LOG')) {
            guild.channels.get(channelsFile.get('server_log')).send({
                embed: {
                    color: config.color_success,
                    author: {
                        name: `${user.username}#${user.discriminator}`,
                        icon_url: user.displayAvatarURL
                    },
                    title: `User unbanned`,
                    thumbnail: {
                        url: user.displayAvatarURL
                    },
                    description: `User ${user} (${user.username}#${user.discriminator} ${user.id}) has been unbanned`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            }).catch(console.error);
        }
    }
}