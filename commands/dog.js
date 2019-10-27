exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CAT')) {
            request(`https://dog.ceo/api/breeds/image/random`,
            function (error, response, body) {
                answer = JSON.parse(body);
                message.channel.send(answer['message']);
            });            
        }
    } // End of permission checking statement
}