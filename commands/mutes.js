exports.run = (client, message, args) => {
    if (message.member.roles.some(r => r.name == 'Moderators')) {
        const modulesFile = client.modulesFile;
        const mutes = client.mutedFile.read();
        if (modulesFile.get('COMMAND_LISTMUTES')) {
            if (args.length > 0) {
                if (args[0] == 'list') {
                    let fields = [];
                    for (let key in mutes) {
                        let user = client.users.get(key);
                        const start = new Date(mutes[key].start * 1000).toUTCString();
                        const end = new Date(mutes[key].end * 1000).toUTCString();
                        let s = Math.floor(mutes[key].end - (Date.now() / 1000));
                        let d = 0;
                        let h = 0;
                        let m = 0;
                        while (s >= 60) {
                            while (m >= 60) {
                                while (h >= 24) {
                                    h -= 24;
                                    d++;
                                }
                                m -= 60;
                                h++;
                            }
                            s -= 60;
                            m++;
                        }
                        let time = '';
                        switch (d) {
                            case 0:
                                switch (h) {
                                    case 0:
                                        switch (m) {
                                            case 0:
                                                time = `${s}s`;
                                                break;
                                            default:
                                                time = `${m}m${s}s`
                                                break;
                                        }
                                        break;
                                    default:
                                        time = `${h}h${m}m${s}s`
                                        break;
                                }
                                break;
                            default:
                                time = `${d}d${h}h${m}m${s}s`
                                break;
                        }
                        if (!user) user = client.fetchUser(key);
                        fields.push({
                            name: key,
                            value: `**User:** ${user}\n**Identifier:** ${mutes[key].identifier}\n**Reason:** ${mutes[key].reason}\n**Start:** ${start}\n**End:** ${end}\n**Duration:** ${mutes[key].duration}\n**Remaining:** ${time}`
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
                }
            }
        } else message.channel.send(':x: That Module is disabled.').catch(console.error);
    }
}