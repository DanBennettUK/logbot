module.exports = (client, member) => {
    const modulesFile = client.modulesFile;
    let connection = client.connection;
    const config = client.config;
    const bannedUsersFile = client.bannedUsersFile;
    const stringSimilarity = client.stringSimilarity;
    const _ = client.underscore;
    const functionsFile = client.functionsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const channelsFile = client.channelsFile;
    const mutes = client.mutedFile.read();
    if (modulesFile.get('EVENT_GUILD_MEMBER_ADD')) {
        const params = [member.user.id, member.user.username,member.user.avatar, 1, new Date(), member.user.id, member.user.id, new Date()];
        connection.query(`INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES (?,?,?,?,?);
        UPDATE users SET exist = 1 WHERE userID = ?;
        INSERT INTO log_guildjoin (userID, timestamp) VALUES (?,?);`, params,
        function (err, results) {
            if (err) {
                connection = functionsFile.establishConnection(client);
                connection.query(`INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES (?,?,?,?,?);
                UPDATE users SET exist = 1 WHERE userID = ?;
                INSERT INTO log_guildjoin (userID, timestamp) VALUES (?,?);`, params,
                function (err, results) {
                    if (err) throw err;
                });
            }
        });
        if (channelsFile.get('server_log')) {
            if (!member.guild.channels.get(channelsFile.get('server_log'))) {
                return;
            }
            if (modulesFile.get('EVENT_GUILD_MEMBER_ADD_LOG')) {
                member.guild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_success,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator}`,
                            icon_url: member.user.displayAvatarURL
                        },
                        title: `User joined`,
                        thumbnail: {
                            url: member.user.displayAvatarURL
                        },
                        description: `User ${member.user} (${member.user.username}#${member.user.discriminator} ${member.user.id}) has joined ${member.guild.name}`,
                        timestamp: Date.now(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            }
        }
    }

    if (modulesFile.get('EVENT_BANNDUSER_DETEC')) {
        const banndUsers = bannedUsersFile.get();
        const usernames = _.values(banndUsers);
        const ids = _.keys(banndUsers);
        let hits = [];
        let identifiers = [];
        let data = [];
        let msg = [];

        const match = stringSimilarity.findBestMatch(member.user.username, usernames);

        for (let a = 0; a < match['ratings'].length; a++) {
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

            connection.query('SELECT * FROM log_guildbans WHERE identifier IN (?) AND actioner <> \'001\'', data,
            function (err, rows, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('SELECT * FROM log_guildbans WHERE identifier IN (?) AND actioner <> \'001\'', data,
                    function (err, rows, results) {
                        if (err) throw err;
                        if (rows.length == 0) return;
                        for (let b = 0; b < rows.length; b++) {
                            const row = rows[b];
                            msg.push({
                                name: `${hits[b].username}`,
                                value: `\`Match:\` ${Math.round(hits[b].rating.toString().substring(0, 5) * 100 * 10) / 10}%\n\`Identifier:\` ${hits[b].identifier}\n\`Date banned:\` ${row.timestamp.toUTCString()}\n\`Reason:\` ${row.description}`
                            });
                        }
                        if (channelsFile.get('action_log')) {
                            if (!member.guild.channels.get(channelsFile.get('action_log'))) {
                                return;
                            }
                            member.guild.channels.get(channelsFile.get('action_log')).send({
                                embed: {
                                    color: config.color_warning,
                                    title: `❗ ${member.user.username}#${member.user.discriminator} matches one or more previous ban record(s)`,
                                    fields: msg,
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
                        }
                        msg.forEach(m => {
                            const identifier = cryptoRandomString({length: 10});
                            const desc = `BANNED USER DETECTION\nUsername: ${m.name.replace(/\*/g, '')}\n${m.value.replace(/`/g, '')}`;
                            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', desc, identifier, 0, new Date()],
                            function(err, results) {
                                if (err) {
                                    connection = functionsFile.establishConnection(client);
                                    connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', desc, identifier, 0, new Date()],
                                    function(err, results) {
                                        if (err) throw err;
                                    });
                                }
                            });
                        });
                    });
                } else {
                    if (rows.length == 0) return;
                    for (let b = 0; b < rows.length; b++) {
                        const row = rows[b];
                        msg.push({
                            name: `${hits[b].username}`,
                            value: `\`Match:\` ${Math.round(hits[b].rating.toString().substring(0, 5) * 100 * 10) / 10}%\n\`Identifier:\` ${hits[b].identifier}\n\`Date banned:\` ${row.timestamp.toUTCString()}\n\`Reason:\` ${row.description}`
                        });
                    }
                    if (channelsFile.get('action_log')) {
                        if (!member.guild.channels.get(channelsFile.get('action_log'))) {
                            return;
                        }
                        member.guild.channels.get(channelsFile.get('action_log')).send({
                            embed: {
                                color: config.color_warning,
                                title: `❗ ${member.user.username}#${member.user.discriminator} matches one or more previous ban record(s)`,
                                fields: msg,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                    }
                    msg.forEach(m => {
                        const identifier = cryptoRandomString({length: 10});
                        const desc = `BANNED USER DETECTION\nUsername: ${m.name.replace(/\*/g, '')}\n${m.value.replace(/`/g, '')}`;
                        connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', desc, identifier, 0, new Date()],
                        function(err, results) {
                            if (err) {
                                connection = functionsFile.establishConnection(client);
                                connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', desc, identifier, 0, new Date()],
                                function(err, results) {
                                    if (err) throw err;
                                });
                            }
                        });
                    });
                }
            });
        }
    }
    if (modulesFile.get('EVENT_NEWACC_DETEC')) {
        if (member.user.createdTimestamp > (Date.now() - 1000 * 60 * 60 * 24 * 7)) {
            let s = Math.floor((member.joinedTimestamp - member.user.createdTimestamp) / 1000);
            let d = 0;
            let h = 0;
            let m = 0;
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
            let time = '';
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
            if (channelsFile.get('action_log')) {
                if (!member.guild.channels.get(channelsFile.get('action_log'))) {
                    return;
                }
                member.guild.channels.get(channelsFile.get('action_log')).send({
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
                                value: `${member.user.createdAt.toUTCString()},\njoined the guild ${time} after creation`,
                                inline: true
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            }
            const message = `Account created on ${member.user.createdAt.toUTCString()}, joined the guild ${time} after creation.`
            const identifier = cryptoRandomString({length: 10});
            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', message, identifier, 0, new Date()],
            function(err, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [member.id, '001', message, identifier, 0, new Date()],
                    function(err, results) {
                        if (err) throw err;
                    });
                }
            });
        }
    }
    const muted = Object.keys(mutes);
    if (muted.includes(member.id)) {
        let mutedRole = member.guild.roles.find(r => r.name == 'Muted');
        member.addRole(mutedRole).then(async member => {
            member.setVoiceChannel(null);
            const identifier = cryptoRandomString({length: 10});
            const data = [member.id, '001', 'User left and rejoined the guild while muted.', identifier, 0, new Date()]
            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
            function(err, results) {
                if (err) throw err;
            });
            if (channelsFile.get('action_log')) {
                if (member.guild.channels.get(channelsFile.get('action_log'))) {
                    member.guild.channels.get(channelsFile.get('action_log')).send(`${member} has left and rejoined the guild while muted. ${mutedRole} has been re-added.`).catch(console.error);
                }
            }
        }).catch(console.error);
    }
}