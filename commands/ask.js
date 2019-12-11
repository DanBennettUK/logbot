exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const request = client.request;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ASK')) {
            const query = args.join('+');
            request(`https://api.duckduckgo.com/?q=${query}&format=json`,
                function (error, response, body) {
                    let answer = JSON.parse(body);
                    if (answer.Abstract == '') {
                        if (answer.RelatedTopics.length > 0) {
                            if (answer.RelatedTopics[0].text != '') {
                                message.channel.send(answer.RelatedTopics[0].Text);
                            } else message.channel.send('No results found.');
                        } else message.channel.send('No results found.');
                    } else message.channel.send(answer.Abstract);
                }
            );
        }
    } // End of permission checking statement
}