exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    if (modulesFile.get('COMMAND_ROLL')) {
        var outcome = 0;
        while (outcome == 0) {
            outcome = Math.floor(Math.random() * Math.floor(101));
        }
        message.channel.send(`Your random roll is ${outcome}!`);
    } else {
        message.channel.send(`:x: That module is disabled.`).catch(console.error);
    }
}