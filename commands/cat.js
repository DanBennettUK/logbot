exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ANIMAL_PICTURE')) {
            var random = Math.floor(Math.random() * Math.floor(2));
            switch (random) {
                case 0:
                    request(`https://some-random-api.ml/img/cat`,
                    function (error, response, body) {
                        answer = JSON.parse(body);
                        const attachment = new client.Discord.Attachment(answer['link']);
                        message.channel.send('Fetching picture...').then(msg => {
                            message.channel.send(attachment).then(() => {
                                msg.delete().catch(console.error);
                            }).catch(console.error);
                        }).catch(console.error);
                    });
                    break;
                case 1:
                    request(`http://aws.random.cat/meow`,
                    function (error, response, body) {
                        answer = JSON.parse(body);
                        const attachment = new client.Discord.Attachment(answer['file']);
                        message.channel.send('Fetching picture...').then(msg => {
                            message.channel.send(attachment).then(() => {
                                msg.delete().catch(console.error);
                            }).catch(console.error);
                        }).catch(console.error);
                    });
                    break;
            }
        }
    } // End of permission checking statement
}