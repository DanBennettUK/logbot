module.exports = (client, messageReaction, user) => {
    const modulesFile = client.modulesFile;
    const reactionsFile = client.reactionsFile;
    const _ = client.underscore;
    const guild = messageReaction.message.guild;
    if (user.bot) return;
    if (modulesFile.get('EVENT_MESSAGE_REACTION_ADD')) {
        var reactionObject = reactionsFile.read();
        var chnlIDs = _.keys(reactionObject);
        if (chnlIDs.includes(messageReaction.message.channel.id)) {
            var channelObject = reactionObject[`${messageReaction.message.channel.id}`];
            var msgIDs = _.keys(channelObject);
            if (msgIDs.includes(messageReaction.message.id)) {
                var messageObject = channelObject[`${messageReaction.message.id}`];
                var reactions = _.keys(messageObject);
                var emojis = [];
                reactions.forEach(r => {
                    if (/[0-9]+/.test(r)) var emoji = client.emojis.get(r);
                    else var emoji = r;
                    if (emoji) emojis.push(emoji);
                });
                if (emojis.includes(messageReaction.emoji)) {
                    if (messageReaction.emoji.id) {
                        var role = guild.roles.get(messageObject[`${messageReaction.emoji.id}`]);
                    } else var role = guild.roles.get(messageObject[`${messageReaction.emoji.name}`]);
                    if (role) {
                        guild.member(user.id).addRole(role).catch(console.error);
                    }
                }
            }
        }
    }
}