exports.run = async (client, message, args) => {
    const modulesFile = client.modulesFile;
    const _ = client.underscore;
    const reminderFile = client.reminderFile;
    const config = client.config;
    const functionsFile = client.functionsFile;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_REMINDME')) {
            var user = message.author.id;
            var end;
            var ms;
            if (args[0]) {
                var int = args[0].replace(/[a-zA-Z]$/g, '');
                if (parseInt(int)) {
                    switch (args[0] && args[0].toLowerCase().charAt(args[0].length - 1)) {
                        case 'd':
                            end = Math.floor(Date.now() / 1000) + int * 24 * 60 * 60;
                            ms = Date.now() + 1000 * (int * 24 * 60 * 60);
                            break;
                        case 'h':
                            end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                            ms = Date.now() + 1000 * (int * 24 * 60 * 60);
                            break;
                        case 'm':
                            end = Math.floor(Date.now() / 1000) + int * 60;
                            ms = Date.now() + 1000 * (int * 24 * 60 * 60);
                            break;
                        default:
                            end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                            ms = Date.now() + 1000 * (int * 24 * 60 * 60);
                            break;
                    }

                    var reminder = _.rest(args, 1).join(' ');

                    if (reminder.length > 1000) {
                        message.channel.send(':x: Please keep the reminder message under 1000 characters.');
                        return;
                    }

                    if (reminder.length > 0) {
                        reminder = `${reminder.charAt(0).toUpperCase()}${reminder.slice(1)}`
                        reminderFile.set(`${user}${ms}.who`, message.author.id);
                        reminderFile.set(`${user}${ms}.end`, end);
                        reminderFile.set(`${user}${ms}.reminder`, reminder);
                        reminderFile.set(`${user}${ms}.length`, args[0]);
                        await reminderFile.save();

                        message.channel.send({
                            embed: {
                                color: config.color_success,
                                title: `Reminder Set`,
                                fields: [
                                    {
                                        name: 'Reminder length',
                                        value: `${args[0]}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Reminder content',
                                        value: `${reminder}`,
                                        inline: true
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${config.version}`
                                }
                            }
                        });
                    } else {
                        message.channel.send(':x: Please provide a reminder note.');
                    }
                }
            } else functionsFile.syntaxErr(client, message, 'remindme');
        }
    }
}