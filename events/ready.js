module.exports = client => {
    const functionsFile = client.functionsFile;
    const config = client.config;
    const modulesFile = client.modulesFile;
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

    functionsFile.setReactionRoles(client);

    setInterval(() => functionsFile.checkExpiredMutes(client), 10000);
    setInterval(() => functionsFile.checkReminders(client), 15000);
    if (modulesFile.get('EVENT_CHECK_STREAMERS')) {
        setInterval(() => functionsFile.checkStreamers(client), 60000);
    }
}