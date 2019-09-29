exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    if (message.member.roles.some(role => ['Admins', 'Full Mods'].includes(role.name)) ) {
        if (typeof modulesFile.get(args[0].toUpperCase()) != 'undefined') {
            //Checks if the module provided exists
            if ([0, 1].includes(parseInt(args[1]))) {
                //Parses the string as an int, then checks if the result is a valid <Int> & it's either a 0 or 1
                modulesFile.set(args[0].toUpperCase(), parseInt(args[1]));
                modulesFile.save();

                message.channel.send({
                    embed: {
                        color: config.color_info,
                        title: '🔶 A module was updated',
                        description: args[0].toUpperCase() + ' was set to status ' + args[1],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                });
            } else {
                message.channel.send(`Please provide a valid status\n\nOff: 0\nOn: 1`).then(msg => {
                    setTimeout(async () => {
                        await msg.delete();
                        await message.delete();
                    }, 6000);
                }).catch(console.error);
            }
        } else {
            message.channel.send(`That module was not found. Consider using ${config.prefix}listmodules`);
        }
    } //End of permission checking statement
}