module.exports = async (client, oldMember, newMember) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const config = client.config;
    const bannedUsersFile = client.bannedUsersFile;
    const stringSimilarity = client.stringSimilarity;
    const _ = client.underscore;
    const cryptoRandomString = client.cryptoRandomString;
    const channelsFile = client.channelsFile;
    if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE')) {
        //Checking for nickname changes for logging
        if (oldMember.displayName !== newMember.displayName) {
            var data = [newMember.user.id, newMember.displayName, oldMember.displayName, new Date()];
            connection.query('INSERT INTO log_nickname (userID, new, old, timestamp) VALUES (?,?,?,?)',data,
                function (err, results) {
                    if (err) throw err;
                }
            );
            if (channelsFile.get('server_log')) {
                if (!oldMember.guild.channels.get(channelsFile.get('server_log'))) {
                    return;
                }
                if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE_LOG')) {
                    oldMember.guild.channels.get(channelsFile.get('server_log')).send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: `${oldMember.user.username}#${oldMember.user.discriminator}`,
                                icon_url: oldMember.user.displayAvatarURL
                            },
                            title: `Nickname change`,
                            thumbnail: {
                                url: oldMember.user.displayAvatarURL
                            },
                            description: `User ${oldMember.user} (${oldMember.user.username}#${oldMember.user.discriminator} ${oldMember.user.id}) has changed their nickname\n`,
                            fields: [
                                {
                                    name: 'Old nickname',
                                    value: oldMember.displayName,
                                    inline: true
                                },
                                {
                                    name: 'New nickname',
                                    value: newMember.displayName,
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
        
                var match = stringSimilarity.findBestMatch(newMember.displayName, usernames);
        
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
                        if (err) throw err;
                        if (rows.length == 0) return;
                        for (var b = 0; b < rows.length; b++) {
                            var row = rows[b];
                            msg.push(`\`(${hits[b].rating.toString().substring(0, 5)})\` \`${hits[b].identifier}\` \`${hits[b].username}\` was banned on: \`${row.timestamp.toUTCString()}\` for: \`${row.description}\` \n\n`);
                        }
                        if (channelsFile.get('action_log')) {
                            if (!oldMember.guild.channels.get(channelsFile.get('action_log'))) {
                                return;
                            }
                            newMember.guild.channels.get(channelsFile.get('action_log')).send({
                                embed: {
                                    color: config.color_warning,
                                    title: `❗ ${newMember.user.username}#${newMember.user.discriminator} (${newMember.displayName}) matches one or more previous ban record(s)`,
                                    description: msg.join(' '),
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            }).catch(console.error);
                        }
                        var identifier = cryptoRandomString({length: 10});
                        connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', [newMember.id, '001', msg.join(' '), identifier, 0, new Date()],
                        function(err, results){
                            if (err) throw err;
                        });
                    });
                }
            }
        }
        if (channelsFile.get('server_log')) {
            if (!oldMember.guild.channels.get(channelsFile.get('server_log'))) {
                return;
            }
            if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE_ROLES_LOG')) {
                if (oldMember.roles.size > newMember.roles.size) {
                    var role = oldMember.roles.filter(r => !newMember.roles.has(r.id)).first();
                    await oldMember.guild.fetchAuditLogs({
                        type: 'MEMBER_ROLE_UPDATE'
                    }).then(audit => {
                        var description = `Role ${role} removed from user ${oldMember.user} (${oldMember.user.username}#${oldMember.user.discriminator} ${oldMember.user.id})`;
                        for (var i = 0; i < audit.entries.array().length; i++) {
                            if (audit.entries.array()[i].target == oldMember.user) {
                                description += ` by ${audit.entries.array()[i].executor}`;
                                break;
                            }
                        }
                        oldMember.guild.channels.get(channelsFile.get('server_log')).send({
                            embed: {
                                color: config.color_warning,
                                author: {
                                    name: `${oldMember.user.username}#${oldMember.user.discriminator}`,
                                    icon_url: oldMember.user.displayAvatarURL
                                },
                                title: `Role removal`,
                                description: description,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                    }).catch(console.error);
                }
                if (newMember.roles.size > oldMember.roles.size) {
                    var role = newMember.roles.filter(r => !oldMember.roles.has(r.id)).first();
                    await newMember.guild.fetchAuditLogs({
                        type: 'MEMBER_ROLE_UPDATE'
                    }).then(audit => {
                        var description = `Role ${role} added to user ${newMember.user} (${newMember.user.username}#${newMember.user.discriminator} ${newMember.user.id})`;
                        for (var i = 0; i < audit.entries.array().length; i++) {
                            if (audit.entries.array()[i].target == newMember.user) {
                                description += ` by ${audit.entries.array()[i].executor}`;
                                break;
                            }
                        }
                        oldMember.guild.channels.get(channelsFile.get('server_log')).send({
                            embed: {
                                color: config.color_success,
                                author: {
                                    name: `${newMember.user.username}#${newMember.user.discriminator}`,
                                    icon_url: newMember.user.displayAvatarURL
                                },
                                title: `Role addition`,
                                description: description,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        }).catch(console.error);
                    }).catch(console.error);
                }
            }
        }
    }
}