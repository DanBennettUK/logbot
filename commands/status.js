exports.run = (client, message, args) => {
    let connection = client.connection;
    const config = client.config;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        const client_PING = Math.floor(client.ping);
        connection.on('error', (err) => {
            console.log(err);
            if (err.code == 'PROTOCOL_CONNECTION_LOST') {
                setTimeout(() => {
                    connection = functionsFile.establishConnection(client);
                    connection.ping()
                }, 5000);
            }
        });
        const db_PING = connection.ping();
        let client_STATUS;
        let db_STATUS;

        if (client_PING >= 1 && client_PING <= 500) {
            client_STATUS = 'OK';
        } else if (client_PING > 500 && client_PING <= 5000) {
            client_STATUS = 'Degraded';
        } else {
            client_STATUS = 'Severely Degraded or Error';
        }

        if (db_PING) {
            db_STATUS = 'OK';
        } else {
            db_STATUS = 'Severely Degraded or Error';
        }

        message.channel.send({
            embed: {
                color: config.color_info,
                description: `**Client -** ${client_STATUS} (${client_PING}ms)\n **Database -** ${db_STATUS}`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        }).catch(console.error);
    }
}