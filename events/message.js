module.exports = (client, message) => {
    const _ = client.uncerscore;
    const connection = client.connection;
    const functionsFile = client.functionsFile;
    const badWordsFile = client.badWordsFile;
    const customCommands = client.customCommands;
    if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    if (_.indexOf(['dm', 'group'], message.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.

    //Log every message that is processed; message or command.
    var data = [message.author.id, message.id, message.content, '', message.channel.id, 1, new Date()];
    connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
    function (err, results) {
        if (err) throw err;
    });

    if (modulesFile.get('EVENT_CHECKMESSAGECONTENT')) {
        functionsFile.checkMessageContent(client, message);
    }

    if ((!message.content.startsWith(config.prefix) || message.content.startsWith(`${config.prefix} `))) return; //If the message content doesn't start with our prefix, return.

    if (!(_.keys(badWordsFile.read()).length > 0)) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
    }

    let args = message.content.slice(1).trim().split(/\s+/); //Result: ["<TAG>", "Bad", "person!"]
    let command = args.shift().toLowerCase(); //Result: "ban"

    const cmd = client.commands.get(command);

    var publicCommands = ['bugreport', 'forums', 'official', 'report', 'roc', 'support', 'wiki', 'mobile', 'lite'];

    if (_.keys(customCommands.read()).includes(command)) {
        if (publicCommands.includes(command) || message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))) {
            var obj = customCommands.get(command);
            message.channel.send(`${obj.content}`);
            message.delete();
        }
    }

    if (cmd) cmd.run(client, message, args);
}