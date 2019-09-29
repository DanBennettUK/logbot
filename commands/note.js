exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_NOTE')) {
            if (args[0]) {
                var user = functionsFile.parseUserTag(message.guild, args[0]);
            } else {
                message.channel.send(`Format: \`${config.prefix}note [User ID] [Note content]\``);
                return;
            }

            if (user == 'err') {
                message.channel.send('An invalid user was provided. Please try again');
            } else {
                var tail = args.slice(1);
                var note = tail.join(' ').trim();

                if (tail.length > 0) {
                    var identifier = cryptoRandomString({ length: 10 });
                    var data = [user, message.author.id, note, identifier, 0, new Date(), user];
                    connection.query('INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                    function (err, results) {
                        if (err) throw err;

                        message.channel.send({
                            embed: {
                                color: config.color_success,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.displayAvatarURL
                                },
                                title: '[Action] Note added',
                                description: `A note was added to ${client.users.get(user)} by ${message.author}`,
                                fields: [
                                    {
                                        name: 'Content',
                                        value: note
                                    },
                                    {
                                        name: 'Identifier',
                                        value: identifier
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    });
                } else {
                    message.channel.send('The note needs a reason!');
                }
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}