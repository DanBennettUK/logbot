module.exports = (client, guild, user) => {
    const cryptoRandomString = client.cryptoRandomString;
    const bannedUsersFile = client.bannedUsersFile;
    const connection = client.connection;
    const config = client.config;
    var identifier = cryptoRandomString({ length: 10 });
    bannedUsersFile.set(identifier, user.username);
    bannedUsersFile.save();

    var data = [user.id, '001', 'SYSTEM BAN', identifier, 0, new Date()];
    connection.query('INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
        function (err, results) {
            if (err) throw err;
        }
    );
    if (modulesFile.get('EVENT_GUILD_BAN_ADD_LOG')) {
        guild.channels.get(config.channel_serverlog).send({
            embed: {
                color: config.color_success,
                author: {
                    name: `${user.username}#${user.discriminator}`,
                    icon_url: user.displayAvatarURL
                },
                title: 'User banned',
                thumbnail: {
                    url: user.displayAvatarURL
                },
                description: `User ${user} has been banned`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        }).catch(console.error);
    }
}