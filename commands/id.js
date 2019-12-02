exports.run = async (client, message, args) => {
    const functionsFile = client.functionsFile;
    const modulesFile = client.modulesFile;
    if (message.member.roles.some(r => ['Moderators', 'Support'].includes(r.name))) {
        if (modulesFile.get('COMMAND_ID')) {
            if (args.length > 0) {
                if (args.length == 1 && /[0-9]/.test(args[0])) {
                    var user = client.users.get(args[0]);
                    if (user) message.channel.send(`The provided argument is the ID of user ${user}.`).catch(console.error);
                    else {
                        try {
                            user = await client.fetchUser(args[0]);
                            message.channel.send(`The provided argument is the ID of user ${user}.`).catch(console.error);
                        } catch (e) {
                            message.channel.send(':x: The provided ID appears to be invalid.').catch(console.error);
                        }
                        return;
                    }
                }
                const id = functionsFile.parseUserTag(client, message.guild, args.join(' '));
                if (id != 'err') {
                    var user = client.users.get(id);
                    if (user) message.channel.send(`The user ID of user ${user} is ${id}.`).catch(console.error);
                    else {
                        try {
                            user = await client.fetchUser(id);
                            message.channel.send(`The user ID of user ${user} is ${id}.`).catch(console.error);
                        } catch (e) {
                            message.channel.send(':x: I could not find that user.').catch(console.error);
                        }
                    }
                } else message.channel.send(':x: I could not find that user.').catch(console.error);
            } else functionsFile.syntaxErr(client, message, 'id');
        }
    }
}