exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ANIMAL_PICTURE')) {
            request(`https://some-random-api.ml/img/birb`,
            function (error, response, body) {
                answer = JSON.parse(body);
                message.channel.send(answer['link']);
            });
        }
    } // End of permission checking statement
}