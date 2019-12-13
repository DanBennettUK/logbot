exports.run = (client, message, args) => {
    const request = client.request;
    const modulesFile = client.modulesFile;
    const config = client.config;
    if (message.member.roles.some(r => ['Moderators', 'Support'].includes(r.name))) {
        if (modulesFile.get('COMMAND_QUOTE')) {
            request(`https://api.quotable.io/random`,
            function (error, response, body) {
                const answer = JSON.parse(body);
                if (answer.content.length > 0) {
                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            title: `${answer.author}`,
                            description: `${answer.content}`,
                            timestamp: Date.now(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    }).catch(console.error);
                }
            });
        }
    }
}