exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    if (message.member.roles.some(role => 'Moderators' == role.name)) {
        if (modulesFile.get('COMMAND_LFG')) {
            message.delete();
            message.channel.fetchMessages({limit: 2}).then(msgs => {
                msgs.last().delete().then(m => {
                    message.channel.send(`${m.author}, please use the appropriate channel for LFG requests, not ${m.channel} `).then(msg => {
                        setTimeout(() => msg.delete(), 7000);
                    })
                }).catch(console.error);
            }).catch(console.error);
        } else message.channel.send(`:x: That module is disabled.`);
    }
}