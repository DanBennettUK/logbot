exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    let connection = client.connection;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CWARN')) {
            if (args[0] && args[0].length == 10) {
                connection.query('UPDATE log_warn SET isDeleted = 1 WHERE identifier = ?', args[0].trim(),
                    function (err, results, rows) {
                        if (err) {
                            connection = functionsFile.establishConnection(client);
                            connection.query('UPDATE log_warn SET isDeleted = 1 WHERE identifier = ?', args[0].trim(),
                            function (err, results, rows) {
                                if (err) throw err;
                                if (results.affectedRows == 1) {
                                    message.channel.send( `☑ Warning with id \`${args[0].trim()}\` was successfully cleared.`).catch(console.error);
                                } else {
                                    message.channel.send(`:x: A warning with that ID could not be found`).catch(console.error);
                                }
                            });
                        } else {
                            if (results.affectedRows == 1) {
                                message.channel.send( `☑ Warning with id \`${args[0].trim()}\` was successfully cleared.`);
                            } else {
                                message.channel.send(`:x: A warning with that ID could not be found`).catch(console.error);
                            }
                        }
                    }
                );
            } else {
                functionsFile.syntaxErr(client, message, 'cwarn');
            }
        } else {
            message.channel.send(`:x: That module is disabled.`).catch(console.error);
        }
    }
}