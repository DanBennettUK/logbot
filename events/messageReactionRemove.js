module.exports = (client, messageReaction, user) => {
    const modulesFile = client.modulesFile;
    const config = client.config;
    if (user.bot) return;
    if (modulesFile.get('EVENT_MESSAGE_REACTION_REMOVE')) {
        if (messageReaction.message.id == config.reaction_message && messageReaction.message.channel.id == config.reaction_channel) {
            switch (messageReaction.emoji.name) {
                case 'eu':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[EU]'))).catch(console.error);
                    break;
                case 'na':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[NA]'))).catch(console.error);
                    break;
                case 'SA':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[SA]'))).catch(console.error);
                    break;
                case 'asia':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[ASIA]'))).catch(console.error);
                    break;
                case 'sea':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[SEA]'))).catch(console.error);
                    break;
                case 'oce':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[OCE]'))).catch(console.error);
                    break;
                case 'kjp':
                    guild.fetchMember(user).then(u => u.removeRole(guild.roles.find(r => r.name == '[KR/JP]'))).catch(console.error);
                    break;
            }
        }
    }
}