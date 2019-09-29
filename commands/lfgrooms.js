exports.run = (client, message, args) => {
    const LFGRoomsFile = client.LFGRoomsFile;
    const _ = client.underscore;
    const config = client.config;
    if (args[0] && args[0].toLowerCase() === 'add') {
        let next = _.keys(LFGRoomsFile.read()).length + 1;
        LFGRoomsFile.set(args[1], next);
        LFGRoomsFile.save();

        message.channel.send(`Added \`${args[1]}\``);
    }
    if (args[0] && args[0].toLowerCase() === 'remove') {
        LFGRoomsFile.unset(args[1]);
        LFGRoomsFile.save();

        message.channel.send(`Removed \`${args[1]}\``);
    }

    if (_.size(args) == 0) {
        var list = _.keys(LFGRoomsFile.read());

        message.channel.send({
            embed: {
                color: config.color_info,
                title: 'List of LFG rooms',
                description: `${list.join('\n')}`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        });
    }
}