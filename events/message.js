module.exports = (client, message) => {
    const _ = client.underscore;
    var connection = client.connection;
    const functionsFile = client.functionsFile;
    const badWordsFile = client.badWordsFile;
    const customCommands = client.customCommands;
    const modulesFile = client.modulesFile;
    const config = client.config;
    const cryptoRandomString = client.cryptoRandomString;
    if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    if (_.indexOf(['dm', 'group'], message.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.

    //Log every message that is processed; message or command.
    var data = [message.author.id, message.id, message.content, '', message.channel.id, 1, new Date()];
    connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
        function (err, results) {
            if (err) {
                connection = functionsFile.establishConnection(client);
                connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
                    function (err, results) {
                        if (err) throw err;
                    });
            }
        });

    if (modulesFile.get('EVENT_CHECK_MESSAGE_CONTENT')) {
        functionsFile.checkMessageContent(client, message);
    }
    if (modulesFile.get('EVENT_INVITE_LINK_DETECTION')) {
        functionsFile.inviteLinkDetection(client, message);
    }

    var publicCommands = ['bugreport', 'forums', 'invite', 'official', 'report', 'roc', 'support', 'wiki', 'mobile', 'lite'];

    if ((!message.content.startsWith('!') || !message.content.length > 1 || !publicCommands.includes(message.content.slice(1).toLowerCase())) && //Allow usage of '!' for general commands (invite, report...)
        ((!message.content.startsWith(config.prefix) || message.content.startsWith(`${config.prefix} `)))) return; //If the message content doesn't start with our prefix, return.

    if (!(_.keys(badWordsFile.read()).length > 0)) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
    }

    let args = message.content.slice(1).trim().split(/\s+/); //Result: ["<TAG>", "Bad", "person!"]
    let command = args.shift().toLowerCase(); //Result: "ban"

    const cmd = client.commands.get(command);

    if (_.keys(customCommands.read()).includes(command)) {
        if (publicCommands.includes(command) || message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            var obj = customCommands.get(command);
            var content = obj.content;
            var temp = cryptoRandomString({
                length: 10
            });
            var re = new RegExp(temp);
            content = content.replace(/\\\\n/gi, temp);
            content = content.replace(/\\n/gi, '\n');
            content = content.replace(re, '\\n');
            if (args[0]) {
                var channel = message.guild.channels.get(functionsFile.parseChannelTag(client, message.guild, args[0]));
                if (channel) {
                    channel.send(`${content}`).catch(console.error);
                    await message.channel.send(`:white_check_mark: Custom command \`${command}\` successfully run in ${channel}.`);
                } else message.channel.send(':x: I could not parse that channel.').catch(console.error);
            } else {
                message.channel.send(`${content}`).catch(console.error);
                message.delete().catch(console.error);
            }
        }
    }

    if (cmd) cmd.run(client, message, args);
}