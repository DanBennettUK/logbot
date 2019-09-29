module.exports = (client, guild, user) => {
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    const config = client.config;
    const modulesFile = client.modulesFile;
    const bannedUsersFile = client.bannedUsersFile;
    var identifier = cryptoRandomString({length: 10});
    var data = [user.id, '001', "SYSTEM UNBAN", identifier, 0, new Date()];
    connection.query('INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
    function(err, results){
        if(err) throw err;
    });
    connection.query('SELECT identifier FROM log_guildbans WHERE userid = ? ORDER BY timestamp DESC LIMIT 1', user.id,
    function(err, rows, results){
        if(err) throw err;

        bannedUsersFile.set(rows[0].identifier, '');
        bannedUsersFile.save();
    });
    if (modulesFile.get('EVENT_GUILD_BAN_REMOVE_LOG')) {
        guild.channels.get(config.channel_serverlog).send({
            embed: {
                color: config.color_success,
                author: {
                    name: `${user.username}#${user.discriminator}`,
                    icon_url: user.displayAvatarURL
                },
                title: 'User unbanned',
                thumbnail: {
                    url: user.displayAvatarURL
                },
                description: `User ${user} has been unbanned`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        }).catch(console.error);
    }
}