exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ANIMAL_PICTURE')) {
            message.channel.send('Fetching picture...').then(msg => {
                request(`https://some-random-api.ml/img/birb`,
                function (error, response, body) {
                    answer = JSON.parse(body);
                    const attachment = new client.Discord.Attachment(answer['link']);
                    message.channel.send(attachment).then(() => {
                        msg.delete().catch(console.error);
                    }).catch(console.error);
                });
            }).catch(console.error);
        }
    } // End of permission checking statement
}