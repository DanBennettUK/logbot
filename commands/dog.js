exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ANIMAL_PICTURE')) {
            var random = Math.floor(Math.random() * Math.floor(2));
            switch(random) {
                case 0:
                    request(`https://some-random-api.ml/img/dog`,
                    function (error, response, body) {
                        answer = JSON.parse(body);
                        message.channel.send(answer['link']);
                    }); 
                    break;
                case 1:
                    request(`https://dog.ceo/api/breeds/image/random`,
                    function (error, response, body) {
                        answer = JSON.parse(body);
                        message.channel.send(answer['message']);
                    });
                    break;
            }         
        }
    } // End of permission checking statement
}