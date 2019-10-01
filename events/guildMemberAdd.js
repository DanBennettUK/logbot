module.exports = (client, member) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    const bannedUsersFile = client.bannedUsersFile;
    const stringSimilarity = client.stringSimilarity;
    const _ = client.underscore;
    const cryptoRandomString = client.cryptoRandomString;
    if (modulesFile.get('EVENT_GUILD_MEMBER_ADD')) {
        var params = [member.user.id, member.user.username,member.user.avatar, 1, new Date(), member.user.id, member.user.id, new Date()];
        connection.query(`INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES (?,?,?,?,?);
        UPDATE users SET exist = 1 WHERE userID = ?;
        INSERT INTO log_guildjoin (userID, timestamp) VALUES (?,?);`, params,
        function (err, results) {
            if (err) throw err;
        });
        if (modulesFile.get('EVENT_GUILD_MEMBER_ADD_LOG')) {
            member.guild.channels.get(config.channel_serverlog).send({
                embed: {
                    color: config.color_success,
                    author: {
                        name: `${member.user.username}#${member.user.discriminator}`,
                        icon_url: member.user.displayAvatarURL
                    },
                    title: 'User joined',
                    thumbnail: {
                        url: member.user.displayAvatarURL
                    },
                    description: `User ${member.user} has joined ${member.guild.name}`,
                    timestamp: Date.now(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            });
        }
    }

    if (modulesFile.get('EVENT_BANNDUSER_DETEC')) {
        var banndUsers = bannedUsersFile.get();
        var usernames = _.values(banndUsers);
        var ids = _.keys(banndUsers);
        var hits = [];
        var identifiers = [];
        var data = [];
        var msg = [];
        var description;

        var match = stringSimilarity.findBestMatch(member.user.username, usernames);

        for (var a = 0; a < match['ratings'].length; a++) {
            if (match['ratings'][a].rating >= 0.5) {
                hits.push({
                    username: match['ratings'][a].target, //Username of the ban
                    rating: match['ratings'][a].rating, //decimal of the similarity
                    identifier: ids[a] //<identifier> of the ban
                });
                identifiers.push(ids[a]);
            }
        }

        if (identifiers.length > 0) {
            data.push(identifiers); //If this work - ew.....you motherfucker, it did.

            connection.query('SELECT * FROM log_guildbans WHERE identifier IN (?)', data,
            function (err, rows, results) {
                if (err) throw err;
                for (var b = 0; b < rows.length; b++) {
                    var row = rows[b];
                    msg.push(`\`(${hits[b].rating.toString().substring(0, 5)})\` \`${hits[b].identifier}\` \`${hits[b].username}\` was banned on: \`${row.timestamp.toUTCString()}\` for: \`${row.description}\` \n\n`);
                }
                member.guild.channels.get(config.channel_serverlog).send({
                    embed: {
                        color: config.color_warning,
                        title: `❗ ${member.user.username}#${member.user.discriminator} matches one or more previous ban record(s)`,
                        description: msg.join(' '),
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
                var identifier = cryptoRandomString({length: 10});
                connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', msg.join(' '), identifier, 0, new Date()],
                function(err, results){
                    if (err) throw err;
                });
            });
        }
    }
    if (modulesFile.get('EVENT_NEWACC_DETEC')) {
        if (member.user.createdTimestamp > (Date.now() - 1000 * 60 * 60 * 24 * 7)) {
            member.guild.channels.get(config.channel_serverlog).send({
                embed: {
                    color: config.color_warning,
                    author: {
                        name: `${member.user.username}#${member.user.discriminator}`,
                        icon_url: member.user.displayAvatarURL
                    },
                    title: '❗ new Discord account',
                    fields: [
                        {
                            name: 'User',
                            value: `${member}\nID: ${member.id}`,
                            inline: true
                        },
                        {
                            name: 'Created',
                            value: `${member.user.createdAt.toUTCString()}`,
                            inline: true
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                    }
                }
            }).catch(console.error);
            var s = Math.floor((member.joinedTimestamp - member.user.createdTimestamp) / 1000);
            console.log(s);
            var d = 0;
            var h = 0;
            var m = 0;
            while (s >= 60) {
                while (m >= 60) {
                    while (h >= 24) {
                        h -= 24;
                        d++;
                    }
                    m -= 60;
                    h++;
                }
                s -= 60;
                m++;
            }
            var time = '';
            switch (d) {
                case 0:
                    switch (h) {
                        case 0: 
                            switch (m) {
                                case 0:
                                    time = `${s}s`;
                                    break;
                                default:
                                    time = `${m}m${s}s`
                                    break;
                            }
                            break;
                        default: 
                            time = `${h}h${m}m${s}s`
                            break;
                    }
                    break;
                default:
                    time = `${d}d${h}h${m}m${s}s`
                    break;
            }
            var message = `Account created on ${member.user.createdAt.toUTCString()}, joined the guild ${time} after creation.`
            var identifier = cryptoRandomString({length: 10});
            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', message, identifier, 0, new Date()],
            function(err, results){
                if (err) throw err;
            });
        }
    }
}