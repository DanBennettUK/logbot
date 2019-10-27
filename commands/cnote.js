exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CNOTE')) {
            if (args[0] && args[0].length == 10) {
                connection.query('UPDATE log_note SET isDeleted = 1 WHERE identifier = ?', args[0].trim(),
                function (err, results, rows) {
                    if (err) throw err;
                    if (results.affectedRows == 1) {
                        message.channel.send(`☑ Note with id \`${args[0].trim()}\` was successfully cleared.`);
                    } else {
                        message.channel.send(`A note with that ID could not be found`).then(msg => {
                            setTimeout(async () => {
                                await msg.delete();
                                await message.delete();
                            }, 6000);
                        }).catch(console.error);
                    }
                });
            } else {
                functionsFile.syntaxErr(client, message, 'cnote');
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
}