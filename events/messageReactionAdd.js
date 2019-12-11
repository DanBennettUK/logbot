module.exports = (client, messageReaction, user) => {
    const modulesFile = client.modulesFile;
    const reactionsFile = client.reactionsFile;
    const _ = client.underscore;
    const guild = messageReaction.message.guild;
    if (user.bot) return;
    if (modulesFile.get('EVENT_MESSAGE_REACTION_ADD')) {
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
                    let emoji;
                    if (/[0-9]+/.test(r)) emoji = client.emojis.get(r);
                    else emoji = r;
                    if (emoji) emojis.push(emoji);
                });
                if (emojis.includes(messageReaction.emoji) || emojis.includes(messageReaction.emoji.id) || emojis.includes(messageReaction.emoji.name)) {
                    let role;
                    if (messageReaction.emoji.id) role = guild.roles.get(messageObject[`${messageReaction.emoji.id}`]);
                    else role = guild.roles.get(messageObject[`${messageReaction.emoji.name}`]);
                    if (role) {
                        guild.member(user.id).addRole(role).catch(console.error);
                    }
                }
            }
        }
    }
}