exports.run = (client, message, args) => {
    const config = client.config;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        const staffHelpCommands =
        `[Commands in detail](https://github.com/FMWK/logbot/wiki/Commands-in-detail)

        **Fun commands:**
        ${config.prefix}flipacoin
        ${config.prefix}roll
        ${config.prefix}ask <query>
        ${config.prefix}birb
        ${config.prefix}cat
        ${config.prefix}dog
        ${config.prefix}panda

        **Utility commands:**
        ${config.prefix}module <module> <0/1>
        ${config.prefix}listmodules
        ${config.prefix}users count
        ${config.prefix}users update
        ${config.prefix}ban <user> <reason>
        ${config.prefix}unban <user> <reason>
        ${config.prefix}note <user> <note_content>
        ${config.prefix}cnote <identifier>
        ${config.prefix}warn <user> <reason>
        ${config.prefix}cwarn <identifier>
        ${config.prefix}user <user>
        ${config.prefix}id <user/id>
        ${config.prefix}clear <amount> <channel> <user>
        ${config.prefix}voicelog <user>
        ${config.prefix}vclog <channel>
        ${config.prefix}vc <user>
        ${config.prefix}vct <user>
        ${config.prefix}disconnect <user>
        ${config.prefix}badwords add <word/s>
        ${config.prefix}badwords remove <word/s>
        ${config.prefix}badwords clear
        ${config.prefix}badwords list
        ${config.prefix}emoji add <name> <emoji>
        ${config.prefix}emoji remove <emoji>
        ${config.prefix}emoji rename <emoji> <name>
        ${config.prefix}emoji list
        ${config.prefix}mute <user> <length> <reason>
        ${config.prefix}unmute <user> <reason>
        ${config.prefix}remindme <length> <reminder>
        ${config.prefix}commands add <command> <content>
        ${config.prefix}commands remove <command>
        ${config.prefix}commands list
        ${config.prefix}reactions add <channel> <message_id> <emoji> <role>
        ${config.prefix}reactions remove [channel] [message_id] [emoji]
        ${config.prefix}reactions list
        ${config.prefix}reactions reset
        ${config.prefix}lfgrooms add <channel>
        ${config.prefix}lfgrooms remove <channel>
        ${config.prefix}lfgrooms list
        ${config.prefix}channels set <server/action/voice_log> [channel]
        ${config.prefix}channels unset <server/action/voice_log>
        ${config.prefix}channels list
        ${config.prefix}lfg
        ${config.prefix}lock
        ${config.prefix}unlock
        ${config.prefix}edit <channel> <message> <content>`;

        message.channel.send({
            embed: {
                color: config.color_info,
                title: `**Listing all available commands:**`,
                author: {
                    name: client.user.username,
                    icon_url: client.user.displayAvatarURL
                },
                description: `${staffHelpCommands}`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        }).catch(console.error);
        return;
    }
    if (message.member.roles.some(role => ['Support'].includes(role.name))) {
        const helperCommands =
            `**Fun commands:**
        **${config.prefix}flipacoin:** This command will flip a coin and return the result.
        **${config.prefix}roll:** This command will return a random number between 1 and 100.
        **${config.prefix}ask <query>:** This command will return an answer to the query.
        **${config.prefix}birb:** This command will return a random bird picture.
        **${config.prefix}cat:** This command will return a random cat picture.
        **${config.prefix}dog:** This command will return a random dog picture.
        **${config.prefix}dog:** This command will return a random pands picture.

        **Utility commands:**
        **${config.prefix}note <user> <note_content>:** This command is used to add notes to a user. When a note is added to a user, they are not notified.
        **${config.prefix}clear <amount> <channel> <user>:** This command is used to clear messages written by a user in the given channel.
        **${config.prefix}mute <user> <length> <reason>:** This command is used to mute a user for a given time period (maximum of 5 minutes).
        **${config.prefix}commands list:** This command lists all current custom commands.
        **${config.prefix}remindme <length> <reminder>:** This command is used to remind you of the note provided after the specified time has passed.

        Length formats (Case insensitive):
        \`1m\`
        \`1h\`
        \`1d\`
        \`1\` - If no suffix is given, default will be hours`;

        message.channel.send({
            embed: {
                color: config.color_info,
                title: `**Listing all available commands:**`,
                author: {
                    name: client.user.username,
                    icon_url: client.user.displayAvatarURL
                },
                description: `${helperCommands}`,
                timestamp: new Date(),
                footer: {
                    text: `Marvin's Little Brother | Current version: ${config.version}`
                }
            }
        }).catch(console.error);
        return;
    }

    const helpCommands =
    `${config.prefix}invite
    ${config.prefix}bugreport
    ${config.prefix}forums
    ${config.prefix}invite
    ${config.prefix}official
    ${config.prefix}mobile
    ${config.prefix}lite
    ${config.prefix}report
    ${config.prefix}roc
    ${config.prefix}support
    ${config.prefix}wiki`;

    message.channel.send({
        embed: {
            color: config.color_info,
            title: `**Listing all available commands:**`,
            author: {
                name: client.user.username,
                icon_url: client.user.displayAvatarURL
            },
            description: `${helpCommands}`,
            timestamp: new Date(),
            footer: {
                text: `Marvin's Little Brother | Current version: ${config.version}`
            }
        }
    }).catch(console.error);
}