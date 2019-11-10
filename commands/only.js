exports.run = async (client, message, args) => {
    const functionsFile = client.functionsFile;
    const modulesFile = client.modulesFile;
    if (message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
        if (modulesFile.get('COMMAND_ONLY')) {
            if (args.length > 0) {
                const channel = message.guild.channels.get(functionsFile.parseChannelTag(client, message.guild, args[0]));
                if (channel) channel.send('Keep it LFG only or be muted.').catch(console.error);
                else message.channel.send(':x: I could not parse that channel.').catch(console.error);
            } else message.channel.send('Keep it LFG only or be muted.').catch(console.error);
        } else message.channel.send('That module is disabled.').catch(console.error);
    }
}