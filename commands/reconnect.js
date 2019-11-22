exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(r => ['Admins', 'Full Mods'].includes(r.name))) {
        if (modulesFile.get('COMMAND_RECONNECT')) {
            functionsFile.establishConnection(client);
            message.channel.send(`:white_check_mark: Database connection reestablished successfully.`).catch(console.error);
        } else message.channel.send(':x: That module is disabled.').catch(console.error);
    }
}