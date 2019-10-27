exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_CAT')) {
            request(`http://aws.random.cat/meow`,
            function (error, response, body) {
                answer = JSON.parse(body);
                message.channel.send(answer['file']);
            });            
        }
    } // End of permission checking statement
}