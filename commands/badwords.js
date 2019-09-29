exports.run = (client, message, args) => {
    const badWordsFile = client.badWordsFile;
    const config = client.config;
    if (args[0].toLowerCase() === 'add') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (args[1]) {
                var newWords = args.splice(1);
                for (var i = 0; i < newWords.length; i++) {
                    for (var j = 0; j < newWords.length; j++) {
                        if (i != j && newWords[i] == newWords[j]) {
                            message.channel.send(`:x: The argument contains duplicates.`);
                            return;
                        }
                    }
                }
                var currentWords = badWordsFile.get(`badWords`);
                if (currentWords.length > 0) {
                    if (currentWords.some(word => newWords.includes(word))) {
                        message.channel.send(`:x: One or more words are already on the list.`);
                        return;
                    }
                }
                currentWords = currentWords.concat(newWords);
                badWordsFile.set(`badWords`, currentWords);
                badWordsFile.save();
                message.channel.send(`:white_check_mark: Word(s) \`${newWords}\` added successfully.`);
            } else {
                message.channel.send(`Please specify a word or words to add.`).then(msg => {
                    setTimeout(async () => {
                        await message.delete();
                        await msg.delete();
                    }, 7000);
                }).catch(console.error);
            }
        }
    }
    if (args[0].toLowerCase() === 'remove') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            if (args[1]) {
                var newWords = args.splice(1);
                for (var i = 0; i < newWords.length; i++) {
                    for (var j = 0; j < newWords.length; j++) {
                        if (i != j && newWords[i] == newWords[j]) {
                            message.channel.send(`:x: The argument contains duplicates.`);
                            return;
                        }
                    }
                }
                var currentWords = badWordsFile.get(`badWords`);
                var numberOfElements = 0;
                for (var i = 0; i < newWords.length; i++) {
                    for (var j = 0; j < currentWords.length; j++) {
                        if (newWords[i] === currentWords[j]) {
                            numberOfElements++;
                        }
                    }
                }
                if (numberOfElements < newWords.length) {
                    message.channel.send(`:x: One or more words are not on the list.`);
                    return;
                }
                for (var i = 0; i < currentWords.length; i++) {
                    for (var j = 0; j < newWords.length; j++) {
                        if (currentWords[i] === newWords[j]) {
                            currentWords = currentWords.splice(i, 1);
                        }
                    }
                }
                badWordsFile.save();
                message.channel.send(`:white_check_mark: \`${newWords}\` removed successfully.`);
            } else {
                message.channel.send(`Please specify a word or words to remove.`).then(msg => {
                    setTimeout(async () => {
                        await message.delete();
                        await msg.delete();
                    }, 7000);
                }).catch(console.error);
            }
        }
    }
    if (args[0].toLowerCase() === 'clear') {
        if (message.member.roles.some(role => ['Admins'].includes(role.name))) {
            if (badWordsFile.get(`badWords`).length > 0) {
                badWordsFile.unset(`badWords`);
                badWordsFile.set(`badWords`, []);
                badWordsFile.save();
                message.channel.send(`:white_check_mark: All bad words successfully removed.`);
            } else message.channel.send(`:x: No bad words could be found.`);
        }
    }
    if (args[0].toLowerCase() === 'list') {
        if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
            var currentWords = badWordsFile.get(`badWords`).join(`\n`);
            if (currentWords) {
                message.channel.send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                        },
                        title: `Current bad words:`,
                        description: `${currentWords}`,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                    }
                });
            } else {
                message.channel.send({
                    embed: {
                        color: config.color_info,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                        },
                        title: `Current bad words:`,
                        description: `No bad words could be found.`,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version }`
                        }
                    }
                });
            }
        }
    }
}