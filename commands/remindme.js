exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const _ = client.underscore;
    const reminderFile = client.reminderFile;
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_REMINDME')) {
            var user = message.author.id;
            var end;
            var int = args[0].replace(/[a-zA-Z]$/g, '');
            if (parseInt(int)) {
                switch (args[0] && args[0].toLowerCase().charAt(args[0].length - 1)) {
                    case 'd':
                        end = Math.floor(Date.now() / 1000) + int * 24 * 60 * 60;
                        seconds = int * 24 * 60 * 60;
                        break;
                    case 'h':
                        end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                        seconds = int * 60 * 60;
                        break;
                    case 'm':
                        end = Math.floor(Date.now() / 1000) + int * 60;
                        seconds = int * 60;
                        break;
                    default:
                        end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                        seconds = int * 60 * 60;
                        break;
                }

                var reminder = _.rest(args, 1).join(' ');

                if (reminder.length > 0) {
                    reminderFile.set(`${user}${end}.who`, message.author.id);
                    reminderFile.set(`${user}${end}.end`, end);
                    reminderFile.set(`${user}${end}.reminder`, reminder);
                    reminderFile.set(`${user}${end}.length`, args[0]);
                    reminderFile.save();

                    message.channel.send({
                        embed: {
                            color: config.color_success,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: `Reminder Set`,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                } else {
                    message.channel.send('Please provide a reminder note.');
                }
            }
        }
    }
}