exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    var connection = client.connection;
    const moment = client.moment;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_VOICELOG')) {
            var user;
            if (args.length > 0) {
                user = functionsFile.parseUserTag(client, message.guild, args.join(' '));
            } else {
                functionsFile.syntaxErr(client, message, 'voicelog');
                return;
            }

            if (user == 'err') {
                message.channel.send('An invalid user was provided. Please try again');
            } else {
                client.fetchUser(user).then(u => {
                    message.channel.send({
                        embed: {
                            author: {
                                name: `${u.username}#${u.discriminator}`,
                                icon_url: `${u.displayAvatarURL}`
                            },
                            title: `🎙 Viewing the voice logs of`,
                            description: `${u}\nLoading data...`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${client.config.version}`
                            }
                        }
                    }).then(async msg => {
                        connection.query('SELECT * from log_voice WHERE userID = ? ORDER BY timestamp DESC LIMIT 22', user,
                        async function (err, rows, results) {
                            if (err) {
                                connection = functionsFile.establishConnection(client);
                                connection.query('SELECT * from log_voice WHERE userID = ? ORDER BY timestamp DESC LIMIT 22', user,
                                    async function (err, rows, results) {
                                        if (err) throw err;

                                        var times = [];
                                        var current = [];
                                        var timestamps = [];
                                        /*var msg = [
                                            'Channel        |                     Timestamp                     | Duration (H:M:S)',
                                            '------------------------------------------------------------------------------------------------'
                                        ];*/
                                        for (var i = rows.length - 1; i >= 0; i--) {
                                            var row = rows[i];

                                            if (rows[i - 1]) {
                                                //We have a next event
                                                var next = rows[i - 1];

                                                if (row.type !== 3 && [2, 3].indexOf(next.type) > -1) {
                                                    //The current event IS NOT a leave event AND the next event IS a move or leave event. i.e, that's a complete wrap of one channel.
                                                    var time1 = row.timestamp;
                                                    var time2 = next.timestamp;

                                                    var diff = time2.getTime() - time1.getTime();

                                                    var msec = diff;
                                                    var hh = Math.floor(msec / 1000 / 60 / 60);
                                                    msec -= hh * 1000 * 60 * 60;
                                                    hh = hh.toString();
                                                    if (hh.length == 1) hh = `0${hh}`;
                                                    var mm = Math.floor(msec / 1000 / 60);
                                                    msec -= mm * 1000 * 60;
                                                    mm = mm.toString();
                                                    if (mm.length == 1) mm = `0${mm}`;
                                                    var ss = Math.floor(msec / 1000);
                                                    msec -= ss * 1000;
                                                    ss = ss.toString();
                                                    if (ss.length == 1) ss = `0${ss}`;

                                                    times.push(`${hh}:${mm}:${ss}`);
                                                    current.push(row.newChannel);
                                                    timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                                }
                                            } else if (!rows[i - 1] && [1, 2].indexOf(row.type) > -1) {
                                                //No next event available AND current event is a fresh join or move. i.e, we can assume they are still here.
                                                current.push(row.newChannel);
                                                times.push('Active');
                                                timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                            }
                                        }
                                        times.reverse();
                                        current.reverse();
                                        timestamps.reverse();

                                        var longest = 0;
                                        for (var i = 0; i < current.length; i++) {
                                            if (current[i].length > longest) {
                                                longest = current[i].length;
                                            }
                                        }
                                        for (var j = 0; j < current.length; j++) {
                                            var howManyToAdd = longest - current[j].length;
                                            current[j] = current[j].padEnd(current[j].length + howManyToAdd + 1);
                                        }

                                        var longestTime = 0;
                                        for (var i = 0; i < timestamps.length; i++) {
                                            if (current[i].length > longestTime) {
                                                longestTime = timestamps[i].length;
                                            }
                                        }
                                        for (var j = 0; j < timestamps.length; j++) {
                                            var howManyToAdd = longestTime - timestamps[j].length;
                                            timestamps[j] = timestamps[j].padEnd(timestamps[j].length + howManyToAdd + 1);
                                        }

                                        /*for (var i = 0; i < times.length; i++) {
                                            msg.push(`${current[i]}|     ${timestamps[i]}     | ${times[i]}`);
                                        }
                                        var joinedMessage = msg.join('\n');
                                        message.channel.send(`🎙 Viewing the voice logs of ${u} \`\`\`${joinedMessage}\`\`\``);*/
                                        msg.edit({
                                            embed: {
                                                author: {
                                                    name: `${u.username}#${u.discriminator}`,
                                                    icon_url: `${u.displayAvatarURL}`
                                                },
                                                title: `🎙 Viewing the voice logs of`,
                                                description: `${u}`,
                                                fields: [{
                                                        name: 'Channel',
                                                        value: `${current.join('\n')}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: 'Timestamp',
                                                        value: `${timestamps.join('\n')}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: 'Duration',
                                                        value: `${times.join('\n')}`,
                                                        inline: true
                                                    }
                                                ],
                                                timestamp: new Date(),
                                                footer: {
                                                    text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                                }
                                            }
                                        }).catch(console.error);
                                    });
                            } else {
                                var times = [];
                                var current = [];
                                var timestamps = [];
                                /*var msg = [
                                    'Channel        |                     Timestamp                     | Duration (H:M:S)',
                                    '------------------------------------------------------------------------------------------------'
                                ];*/
                                for (var i = rows.length - 1; i >= 0; i--) {
                                    var row = rows[i];

                                    if (rows[i - 1]) {
                                        //We have a next event
                                        var next = rows[i - 1];

                                        if (row.type !== 3 && [2, 3].indexOf(next.type) > -1) {
                                            //The current event IS NOT a leave event AND the next event IS a move or leave event. i.e, that's a complete wrap of one channel.
                                            var time1 = row.timestamp;
                                            var time2 = next.timestamp;

                                            var diff = time2.getTime() - time1.getTime();

                                            var msec = diff;
                                            var hh = Math.floor(msec / 1000 / 60 / 60);
                                            msec -= hh * 1000 * 60 * 60;
                                            hh = hh.toString();
                                            if (hh.length == 1) hh = `0${hh}`;
                                            var mm = Math.floor(msec / 1000 / 60);
                                            msec -= mm * 1000 * 60;
                                            mm = mm.toString();
                                            if (mm.length == 1) mm = `0${mm}`;
                                            var ss = Math.floor(msec / 1000);
                                            msec -= ss * 1000;
                                            ss = ss.toString();
                                            if (ss.length == 1) ss = `0${ss}`;

                                            times.push(`${hh}:${mm}:${ss}`);
                                            current.push(row.newChannel);
                                            timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                        }
                                    } else if (!rows[i - 1] && [1, 2].indexOf(row.type) > -1) {
                                        //No next event available AND current event is a fresh join or move. i.e, we can assume they are still here.
                                        current.push(row.newChannel);
                                        times.push('Active');
                                        timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                                    }
                                }
                                times.reverse();
                                current.reverse();
                                timestamps.reverse();

                                var longest = 0;
                                for (var i = 0; i < current.length; i++) {
                                    if (current[i].length > longest) {
                                        longest = current[i].length;
                                    }
                                }
                                for (var j = 0; j < current.length; j++) {
                                    var howManyToAdd = longest - current[j].length;
                                    current[j] = current[j].padEnd(current[j].length + howManyToAdd + 1);
                                }

                                var longestTime = 0;
                                for (var i = 0; i < timestamps.length; i++) {
                                    if (current[i].length > longestTime) {
                                        longestTime = timestamps[i].length;
                                    }
                                }
                                for (var j = 0; j < timestamps.length; j++) {
                                    var howManyToAdd = longestTime - timestamps[j].length;
                                    timestamps[j] = timestamps[j].padEnd(timestamps[j].length + howManyToAdd + 1);
                                }

                                /*for (var i = 0; i < times.length; i++) {
                                    msg.push(`${current[i]}|     ${timestamps[i]}     | ${times[i]}`);
                                }
                                var joinedMessage = msg.join('\n');
                                message.channel.send(`🎙 Viewing the voice logs of ${u} \`\`\`${joinedMessage}\`\`\``);*/
                                if (times.length == 0) {
                                    current.push('No results found');
                                    timestamps.push('No results found');
                                    times.push('No results found');
                                }
                                msg.edit({
                                    embed: {
                                        author: {
                                            name: `${u.username}#${u.discriminator}`,
                                            icon_url: `${u.displayAvatarURL}`
                                        },
                                        title: `🎙 Viewing the voice logs of`,
                                        description: `${u}`,
                                        fields: [{
                                                name: 'Channel',
                                                value: `${current.join('\n')}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Timestamp',
                                                value: `${timestamps.join('\n')}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Duration',
                                                value: `${times.join('\n')}`,
                                                inline: true
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${client.config.version}`
                                        }
                                    }
                                }).catch(console.error);
                            }
                        });
                    })
                }).catch(() => message.channel.send(`An invalid user was provided. Please try again.`).catch(console.error));
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}