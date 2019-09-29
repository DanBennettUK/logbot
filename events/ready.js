module.exports = client => {
    const functionsFile = client.functionsFile;
    const config = client.config;
    functionsFile.setupTables(client);

    if (config.test) {
        console.log(`[TEST VERSION] [${new Date()}] Bot Active.`);
    } else {
        console.log(`[${new Date()}] Bot Active.`);
    }

    client.user.setPresence({
        status: 'online'
    });

    //importWarnings();
    //importMutes();
    //importNotes();
    //importBans();
    //importUnbans();

    functionsFile.updateUserTable(client, 'system', null);
    const guild = client.guilds.get(config.guildid);

    var react = guild.channels.get(config.reaction_channel);

    react.fetchMessage(config.reaction_message).then(async m => {
        await m.react(guild.emojis.find(e => e.name == 'eu')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'na')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'SA')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'asia')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'sea')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'oce')).catch(console.error);
        await m.react(guild.emojis.find(e => e.name == 'kjp')).catch(console.error);
    });

    setInterval(functionsFile.checkExpiredMutes(client), 10000);
    setInterval(functionsFile.checkReminders(client), 15000);
    setInterval(functionsFile.checkStreamers(client), 60000);
}