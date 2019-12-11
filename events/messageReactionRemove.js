module.exports = (client, messageReaction, user) => {
    const modulesFile = client.modulesFile;
    const reactionsFile = client.reactionsFile;
    const _ = client.underscore;
    const guild = messageReaction.message.guild;
    if (user.bot) return;
    if (modulesFile.get('EVENT_MESSAGE_REACTION_REMOVE')) {
        const reactionObject = reactionsFile.read();
        const chnlIDs = _.keys(reactionObject);
        if (chnlIDs.includes(messageReaction.message.channel.id)) {
            const channelObject = reactionObject[`${messageReaction.message.channel.id}`];
            const msgIDs = _.keys(channelObject);
            if (msgIDs.includes(messageReaction.message.id)) {
                const messageObject = channelObject[`${messageReaction.message.id}`];
                const reactions = _.keys(messageObject);
                let emojis = [];
                reactions.forEach(r => {
                    if (/[0-9]+/.test(r)) const emoji = client.emojis.get(r);
                    else const emoji = r;
                    if (emoji) emojis.push(emoji);
                });
                if (emojis.includes(messageReaction.emoji) || emojis.includes(messageReaction.emoji.id) || emojis.includes(messageReaction.emoji.name)) {
                    if (messageReaction.emoji.id) const role = guild.roles.get(messageObject[`${messageReaction.emoji.id}`]);
                    else const role = guild.roles.get(messageObject[`${messageReaction.emoji.name}`]);
                    if (role) {
                        guild.member(user.id).removeRole(role).catch(console.error);
                    }
                }
            }
        }
    }
}