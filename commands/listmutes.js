exports.run = (client, message, args) => {
    if (message.member.roles.some(r => r.name == 'Moderators')) {
        const modulesFile = client.modulesFile;
        const mutes = client.mutedFile.read();
        if (modulesFile.get('COMMAND_LISTMUTES')) {
            let fields = [];
            for (let key in mutes) {
                let user = client.users.get(key);
                const start = new Date(mutes[key].start * 1000).toUTCString();
                const end = new Date(mutes[key].end * 1000).toUTCString();
                if (!user) user = client.fetchUser(key);
                fields.push({
                    name: key,
                    value: `**User:** ${user}\n**Identifier:** ${mutes[key].identifier}\n**Reason:** ${mutes[key].reason}\n**Start:** ${start}\n**End:** ${end}\n**Duration:** ${mutes[key].duration}`
                });
            }
            if (fields.length == 0) message.channel.send('No mutes are set.').catch(console.error);
            else {
                message.channel.send({
                    embed: {
                        color: client.config.color_info,
                        title: 'Listing mutes by ID',
                        fields: fields,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${client.config.version}`
                        }
                    }
                }).catch(console.error);
            }
        } else message.channel.send(':x: That Module is disabled.').catch(console.error);
    }
}