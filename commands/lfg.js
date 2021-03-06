exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    if (message.member.roles.some(role => 'Moderators' == role.name)) {
        if (modulesFile.get('COMMAND_LFG')) {
            message.delete().then(() => {
                message.channel.fetchMessages({limit: 1}).then(msgs => {
                    msgs.first().delete().then(m => {
                        message.channel.send(`${m.author}, please use the appropriate channel for LFG requests, not ${m.channel}.`).then(msg => {
                            setTimeout(() => msg.delete(), 30000);
                        }).catch(console.error);
                    }).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
        } else message.channel.send(`:x: That module is disabled.`).catch(console.error);
    }
}