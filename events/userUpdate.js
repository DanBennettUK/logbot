module.exports = (client, oldUser, newUser) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const config = client.config;
    const guild = client.guilds.get(config.guildid)
    const bannedUsersFile = client.bannedUsersFile;
    const stringSimilarity = client.stringSimilarity;
    const _ = client.underscore;
    const cryptoRandomString = client.cryptoRandomString;
    const channelsFile = client.channelsFile;
    const functionsFile = client.functionsFile;
    if (modulesFile.get('EVENT_USER_UPDATE')) {
        //Checking for username changes for logging
        if (oldUser.username !== newUser.username) {
            var data = [newUser.id, newUser.username, oldUser.username, new Date()];
            connection.query('INSERT INTO log_username (userID, new, old, timestamp) VALUES (?,?,?,?)', data, function (err, results) {
                    if (err) {
                        connection = functionsFile.establishConnection(client);
                        connection.query('INSERT INTO log_username (userID, new, old, timestamp) VALUES (?,?,?,?)',
                        [newUser.id, newUser.username, oldUser.username, new Date()],
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
                if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                    guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${newUser.username}#${newUser.discriminator}`,
                                icon_url: newUser.displayAvatarURL
                            },
                            title: `Username change`,
                            thumbnail: {
                                url: newUser.displayAvatarURL
                            },
                            description: `User ${newUser} (${newUser.username}#${newUser.discriminator} ${newUser.id}) has changed their username\n`,
                            fields: [
                                {
                                    name: 'Previous username',
                                    value: `${oldUser.username}`,
                                    inline: true
                                },
                                {
                                    name: 'New username',
                                    value: `${newUser.username}`,
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

                var match = stringSimilarity.findBestMatch(newUser.username, usernames);

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

                    connection.query('SELECT * FROM log_guildbans WHERE identifier IN (?) AND actioner <> \'001\'', data,
                    function (err, rows, results) {
                        if (err) {
                            connection = functionsFile.establishConnection(client);
                            connection.query('SELECT * FROM log_guildbans WHERE identifier IN (?) AND actioner <> \'001\'', data,
                            function (err, rows, results) {
                                if (err) throw err;
                                if (rows.length == 0) return;
                                for (var b = 0; b < rows.length; b++) {
                                    var row = rows[b];
                                    msg.push({
                                        name: `${hits[b].identifier}`,
                                        value: `\`Match:\` ${hits[b].rating.toString().substring(0, 5) * 100}%\n\`Username:\` ${hits[b].username}\n\`Date banned:\` ${row.timestamp.toUTCString()}\n\`Reason:\` ${row.description}`
                                    });                                }
                                if (channelsFile.get('action_log')) {
                                    if (!guild.channels.get(channelsFile.get('action_log'))) {
                                        return;
                                    }
                                    guild.channels.get(channelsFile.get('action_log')).send({
                                        embed: {
                                            color: config.color_warning,
                                            title: `❗ ${newUser.username}#${newUser.discriminator} matches one or more previous ban record(s)`,
                                            fields: msg,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${config.version}`
                                            }
                                        }
                                    }).catch(console.error);
                                }
                                msg.forEach(m => {
                                    var identifier = cryptoRandomString({length: 10});
                                    var desc = `BANNED USER DETECTION\nIdentifier: ${m.name.replace(/\*/g, '')}\n${m.value.replace(/`/g, '')}`;
                                    connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [newUser.id, '001', desc, identifier, 0, new Date()],
                                    function(err, results) {
                                        if (err) {
                                            connection = functionsFile.establishConnection(client);
                                            connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [newUser.id, '001', desc, identifier, 0, new Date()],
                                            function(err, results) {
                                                if (err) throw err;
                                            });
                                        }
                                    });
                                });
                            });
                        } else {
                            if (rows.length == 0) return;
                            for (var b = 0; b < rows.length; b++) {
                                var row = rows[b];
                                msg.push({
                                    name: `${hits[b].identifier}`,
                                    value: `\`Match:\` ${hits[b].rating.toString().substring(0, 5) * 100}%\n\`Username:\` ${hits[b].username}\n\`Date banned:\` ${row.timestamp.toUTCString()}\n\`Reason:\` ${row.description}`
                                });                            }
                            if (channelsFile.get('action_log')) {
                                if (!guild.channels.get(channelsFile.get('action_log'))) {
                                    return;
                                }
                                guild.channels.get(channelsFile.get('action_log')).send({
                                    embed: {
                                        color: config.color_warning,
                                        title: `❗ ${newUser.username}#${newUser.discriminator} matches one or more previous ban record(s)`,
                                        fields: msg,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${config.version}`
                                        }
                                    }
                                }).catch(console.error);
                            }
                            msg.forEach(m => {
                                var identifier = cryptoRandomString({length: 10});
                                var desc = `BANNED USER DETECTION\nIdentifier: ${m.name.replace(/\*/g, '')}\n${m.value.replace(/`/g, '')}`;
                                connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [newUser.id, '001', desc, identifier, 0, new Date()],
                                function(err, results) {
                                    if (err) {
                                        connection = functionsFile.establishConnection(client);
                                        connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [newUser.id, '001', desc, identifier, 0, new Date()],
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
        }

        //Checking for avatar changes to update user table
        if (oldUser.avatar !== newUser.avatar) {
            var data = [newUser.avatar, new Date(), newUser.id];
            connection.query('UPDATE users SET avatar = ?, updated = ? WHERE userID = ?', data,
                function (err, results) {
                    if (err) {
                        connection = functionsFile.establishConnection(client);
                        connection.query('UPDATE users SET avatar = ?, updated = ? WHERE userID = ?', data,
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
                if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                    guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${newUser.username}#${newUser.discriminator}`,
                                icon_url: newUser.displayAvatarURL
                            },
                            title: `Avatar change`,
                            thumbnail: {
                                url: newUser.displayAvatarURL
                            },
                            description: `User ${newUser} (${newUser.username}#${newUser.discriminator} ${newUser.id}) has changed their avatar`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                }
            }
        }
        if (oldUser.discriminator !== newUser.discriminator) {
            if (channelsFile.get('server_log')) {
                if (!guild.channels.get(channelsFile.get('server_log'))) {
                    return;
                }
                if (modulesFile.get('EVENT_USER_UPDATE_LOG')) {
                    guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${newUser.username}#${newUser.discriminator}`,
                                icon_url: newUser.displayAvatarURL
                            },
                            title: `Discriminator change`,
                            thumbnail: {
                                url: newUser.displayAvatarURL
                            },
                            description: `User ${newUser} (${newUser.username}#${newUser.discriminator} ${newUser.id}) has changed their discriminator\n`,
                            fields: [
                                {
                                    name: 'Previous discriminator',
                                    value: `${oldUser.discriminator}`,
                                    inline: true
                                },
                                {
                                    name: 'New discriminator',
                                    value: `${newUser.discriminator}`,
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
            }
        }
    }
}