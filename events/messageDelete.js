module.exports = async (client, message) => {
    const modulesFile = client.modulesFile;
    var connection = client.connection;
    const config = client.config;
    const channelsFile = client.channelsFile;
    const functionsFile = client.functionsFile;
    if (modulesFile.get('EVENT_MESSAGE_DELETE')) {
        if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [message.author.id, message.id, '', message.content, message.channel.id, 3, new Date()];
        connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
            function (err, results) {
                if (err) {
                    connection = functionsFile.establishConnection(client);
                    connection.query('INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
                    function (err, results) {
                        if (err) throw err;
                    });
                }
            }
        );
        if (channelsFile.get('server_log')) {
            if (!message.guild.channels.get(channelsFile.get('server_log'))) {
                return;
            }
            if (modulesFile.get('EVENT_MESSAGE_DELETE_LOG')) {
                var dsc = `Message sent by user ${message.author} (${message.author.username}#${message.author.discriminator} ${message.author.id}) deleted in ${message.channel}`;
                const entry = await message.guild.fetchAuditLogs({
                    type: 'MESSAGE_DELETE'
                }).then(audit => audit.entries.first());
                if (entry.extra.channel.id === message.channel.id &&
                (entry.target.id == message.author.id) && (entry.createdTimestamp > (Date.now() - 5000))) {
                    dsc += ` by ${entry.executor}\n`
                }
                var messageContent = '';
                if (message.type.toLowerCase() == 'pins_add') messageContent = '**AUTOMATED DISCORD MESSAGE**\n📌 A message has been pinned.'
                else if (message.content.length == 0) {
                    if (message.embeds.length > 0) {
                        var embed = msg.embeds[0];
                        var fields = '';
                        var title = 'This embed has no title';
                        if (embed.title) title = embed.title;
                        var dsc = 'This embed has no description';
                        if (embed.description) dsc = embed.description;
                        if (embed.fields.length > 0) embed.fields.forEach(f => fields += `\nField name: ${f.name}\nField content: ${f.value}`);
                        else fields = 'This embed has no fields.';
                        messageContent = `\`${msg.author.username}#${msg.author.discriminator}\`: **EMBED:**
                        title: ${title}
                        description: ${dsc}
                        fields: ${fields}
                        \n`;
                    } else messageContent = message.attachments.first().filename;
                } else messageContent = message.content;
                if (messageContent.length > 1800) messageContent = 'Message too long ( > 1800 characters)';
                dsc += `\n**Content:**\n\n${messageContent}`;
                message.guild.channels.get(channelsFile.get('server_log')).send({
                    embed: {
                        color: config.color_warning,
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: message.author.displayAvatarURL
                        },
                        title: `Message deletion`,
                        description: dsc,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                }).catch(console.error);
            }
        }
    }
}