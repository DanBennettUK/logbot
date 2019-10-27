module.exports = client => {
    const functionsFile = client.functionsFile;
    const config = client.config;
    const modulesFile = client.modulesFile;
    const channelsFile = client.channelsFile;
    functionsFile.setupTables(client);

    if (config.test) {
        console.log(`[TEST VERSION] [${new Date()}] Bot Active.`);
    } else {
        console.log(`[${new Date()}] Bot Active.`);
    }
    
    if ((!channelsFile.read()) || Object.keys(channelsFile.read()).length == 0) {
        channelsFile.set('server_log', '');
        channelsFile.set('action_log', '');
        channelsFile.set('voice_log', '');
        channelsFile.save();
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

    functionsFile.setReactionRoles(client);

    setInterval(() => functionsFile.checkExpiredMutes(client), 10000);
    setInterval(() => functionsFile.checkReminders(client), 15000);
    if (modulesFile.get('EVENT_CHECK_STREAMERS')) {
        setInterval(() => functionsFile.checkStreamers(client), 60000);
    }
}