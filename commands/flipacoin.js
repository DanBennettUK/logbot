exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    if (modulesFile.get('COMMAND_FLIPACOIN')) {
        var outcome = Math.floor(Math.random() * Math.floor(2));

        switch (outcome) {
            case 0:
                message.channel.send('Heads!');
                break;
            case 1:
                message.channel.send('Tails!');
                break;
        }
    } else {
        message.channel.send(`That module (${command}) is disabled.`);
    }
}