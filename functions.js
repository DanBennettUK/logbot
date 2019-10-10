exports.setupTables = function setupTables(client) {
    const connection = client.connection;
    connection.query(
        `CREATE TABLE IF NOT EXISTS users
        (
          userID VARCHAR(25)        NOT NULL,
          username VARCHAR(255)     NOT NULL,
          avatar VARCHAR(50),
          exist bit                 DEFAULT 1,
          timestamp DATETIME       NOT NULL,
          updated timestamp         NOT NULL,
          PRIMARY KEY (userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_nickname
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          new VARCHAR(255),
          old VARCHAR(255),
          timestamp DATETIME        NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS messageTypes
        (
          id int                    NOT NULL,
          type VARCHAR(100),
          PRIMARY KEY (id)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_message
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          messageID VARCHAR(25)     NOT NULL,
          newMessage text,
          oldMessage text,
          channel VARCHAR(25),
          type int,
          timestamp DATETIME       NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (type) REFERENCES messageTypes(id)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_username
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          new VARCHAR(255),
          old VARCHAR(255),
          timestamp DATETIME        NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS voiceTypes
        (
          id int                    NOT NULL,
          type VARCHAR(100),
          PRIMARY KEY (id)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_voice
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          newChannelID VARCHAR (50),
          newChannel VARCHAR (50),
          oldChannelID VARCHAR (50),
          oldChannel VARCHAR (50),
          type int,
          timestamp DATETIME       NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (type) REFERENCES voiceTypes(id)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_guildjoin
        (
          userID VARCHAR(25)       NOT NULL,
          timestamp DATETIME,
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_guildleave
        (
          userID VARCHAR(25)       NOT NULL,
          timestamp DATETIME,
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_guildbans
        (
          ID INT                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          description TEXT,
          identifier VARCHAR(10),
          isDeleted BIT,
          timestamp DATETIME,
          updated DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (ID),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_guildunbans
        (
          ID INT                     NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          description text,
          identifier VARCHAR(10),
          isDeleted BIT,
          timestamp DATETIME,
          updated DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (ID),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_note
        (
          ID INT                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          description TEXT,
          identifier VARCHAR(10),
          isDeleted BIT,
          timestamp DATETIME        NOT NULL,
          updated DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_warn
        (
          ID INT                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          description TEXT,
          identifier VARCHAR(10),
          isDeleted BIT,
          timestamp DATETIME,
          updated DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_outgoingdm
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          content text,
          type TINYINT,
          isDeleted bit,
          identifier VARCHAR(10),
          timestamp DATETIME        NOT NULL,
          updated timestamp         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_helperclear
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          channel VARCHAR(25),
          amount SMALLINT,
          identifier VARCHAR(10),
          timestamp DATETIME,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_messageremovals
        (
          ID INT                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          channel VARCHAR(25),
          message TEXT,
          timestamp DATETIME,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `CREATE TABLE IF NOT EXISTS log_mutes
        (
          ID INT                  NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25),
          actioner VARCHAR(25),
          description TEXT,
          length MEDIUMINT,
          identifier VARCHAR(10),
          isDeleted BIT,
          timestamp DATETIME,
          updated DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (actioner) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
      `CREATE TABLE IF NOT EXISTS log_unmutes
      (
        ID INT                  NOT NULL AUTO_INCREMENT,
        userID VARCHAR(25),
        actioner VARCHAR(25),
        description TEXT,
        identifier VARCHAR(10),
        isDeleted BIT,
        timestamp DATETIME,
        updated DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
      CHARACTER SET 'utf8mb4'
      COLLATE 'utf8mb4_0900_ai_ci';`,
      function (err, results) {
          if (err) throw err;
      }
  );
    connection.query(
        `INSERT IGNORE INTO messageTypes (id, type) VALUES (1, "create"), (2, "edit"), (3, "delete")`,
        function (err, results) {
            if (err) throw err;
        }
    );
    connection.query(
        `INSERT IGNORE INTO voiceTypes (id, type) VALUES (1, "join"), (2, "move"), (3, "leave")`,
        function (err, results) {
            if (err) throw err;
        }
    );
}

exports.parseUserTag = function parseUserTag(client, guild, tag) {
    /*
    - Function used for parsing multiple types of the <user> argument
    - Valid entries: <@number>, <@!number>, number, username/nickname (will attempt to resolve to a user)

    returns @id <int>
    */
    var trimMe = tag.trim();

    if (/(<@(!)*)+\w+(>)/.test(tag)) {
        return trimMe.replace(/[^0-9.]/gi, '');
    } else if (/[\w\d\\\/\_\|]+(#\d\d\d\d)+$/.test(tag)) {
        var split = tag.split('#');
        var usernameResolve = client.users.find(obj => (obj.username === split[0]) && (obj.discriminator == split[1]));

        if (usernameResolve == null) {
            usernameResolve = client.users.find(obj => (obj.username.toLowerCase() === split[0]) && (obj.discriminator == split[1]));
            if (usernameResolve == null) {
                return 'err';
            } else {
                return usernameResolve.id;
            }
        } else {
            return usernameResolve.id;
        }
    } else if (/^[0-9]+$/.test(tag)) {
        return trimMe;
    } else {
        var usernameResolve = client.users.find(obj => obj.username === tag);
        if (usernameResolve == null) {
            usernameResolve = client.users.find(obj => obj.username.toLowerCase() === tag);
            if (usernameResolve == null) {
                var nicknameResolve = guild.members.find(obj => obj.nickname === tag);
                if (nicknameResolve == null) {
                    nicknameResolve = guild.members.find(obj => obj.nickname.toLowerCase() === tag);
                    if (nicknameResolve == null) {
                        return 'err';
                    } else return nicknameResolve.id;
                } else return nicknameResolve.id;
            } else return usernameResolve.id;
        } else return usernameResolve.id;
    }
}

exports.parseChannelTag = function parseChannelTag(client, guild, tag) {
    /*
    - Function used for parsing multiple types of the <channel> argument

    returns @id <int>
    */
    var trimMe = tag.trim();

    if (/(<#(!)*)+\w+(>)/.test(tag)) {
        return trimMe.replace(/[^0-9.]/gi, '');
    } else if (/^[0-9]+$/.test(tag)) {
        return trimMe;
    } else if (/#.+/.test(tag)) {
        trimMe.replace('#', '');
        var chnl = guild.channels.find(c => c.name === trimMe);
        if (chnl == null) {
            return 'err';
        } else {
            return chnl.id;
        }
    } else if (/.+/.test(tag)) {
        var chnl = guild.channels.find(c => c.name === trimMe);
        if (chnl == null) {
            return 'err';
        } else {
            return chnl.id;
        }
    } else {
        return 'err';
    }
}

exports.updateUserTable = function updateUserTable(client, invoker, channel) {
    const config = client.config;
    const connection = client.connection;
    var memberArray = [];
    var guild = client.guilds.get(config.guildid);

    guild.fetchMembers().then(r => {
        r.members.array().forEach(r => {
            memberArray.push([r.user.id, r.user.username, r.user.avatar, 1, r.joinedAt]);
        });
        connection.query('INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES ?', [memberArray],
            function (err, results) {
                if (err) throw err;
                if (results) {
                    switch (invoker) {
                        case 'user':
                            client.channels.get(channel).send({
                                embed: {
                                    color: config.color_success,
                                    author: {
                                        name: client.user.username,
                                        icon_url: client.user.displayAvatarURL
                                    },
                                    title: '[COMMAND] User update',
                                    description: 'Users that are not known to the database will be added.',
                                    fields: [{
                                            name: 'Total users found',
                                            value: ' ' + memberArray.length
                                        },
                                        {
                                            name: 'Total users inserted',
                                            value: ' ' + results.affectedRows,
                                            inline: true
                                        },
                                        {
                                            name: 'Note',
                                            value: 'If the amount of users inserted is `0`, this is most likely due to the database already being up to date, not an error.'
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            });
                            break;
                        case 'system':
                            console.log(`[INFO] Found ${memberArray.length} users.`);
                            break;
                    }
                }
            }
        );
    });
}

exports.updateGuildBansTable = function updateGuildBansTable(client, invoker, channel) {
    const config = client.config;
    const connection = client.connection;
    var banArray = [];
    var guild = client.guilds.get(config.guildid);

    guild.fetchBans().then(bans => {
        bans.array().forEach(ban => {
            banArray.push([ban.id, ban.username, ban.discriminator, '001', null, 'Ban added via a call to updateGuildBansTable', new Date()]);
        });
        connection.query('INSERT IGNORE INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, timestamp) VALUES ?', [banArray],
            function (err, results) {
                if (err) throw err;
                if (results) {
                    switch (invoker) {
                        case 'user':
                            client.channels.get(channel).send({
                                embed: {
                                    color: config.color_success,
                                    author: {
                                        name: client.user.username,
                                        icon_url: client.user.displayAvatarURL
                                    },
                                    title: '[COMMAND] Bans update',
                                    description: 'Bans that are not known to us will be added to the database',
                                    fields: [{
                                            name: 'Total bans found',
                                            value: `${bans.size}`,
                                            inline: true
                                        },
                                        {
                                            name: 'Total bans inserted',
                                            value: `${results.affectedRows}`,
                                            inline: true
                                        },
                                        {
                                            name: 'Note',
                                            value: 'If the amount of bans inserted is 0, this is most likely due to the database already being up to date, not an error.'
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                }
                            });
                            break;
                        case 'system':
                            console.log(`[INFO] Found ${banArray.length} bans / Inserted ${results.affectedRows} rows. Bans that are not in the database will be added now,`);
                            break;
                    }
                }
            }
        );
    });
}

exports.syntaxErr = function syntaxErr(client, message, command) {
    const config = client.config;
    message.channel.send(`There is a problem in your syntax for \`${config.prefix}${command}\`. Try using \`${config.prefix}help\``).then(msg => {
        setTimeout(async () => {
            await message.delete();
            await msg.delete();
        }, 7000);
    }).catch(console.error);
}

exports.isNull = function isNull(value, def) {
    if (!value || (value === undefined || value === null)) {
        return def;
    } else {
        return value;
    }
}

exports.checkMessageContent = function checkMessageContent(client, message) {
    const badWordsFile = client.badWordsFile;
    const connection = client.connection;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) return;
    var wholeMessage = message.content.split(' ');
    var badWordList = badWordsFile.get(`badWords`);
    if (badWordList == undefined) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
        return;
    }
    if (badWordList.length > 0) {
        if (badWordList.some(word => wholeMessage.includes(word))) {
            message.delete().then(() => {
                message.channel.send(`${message.author} watch your language`).then(msg => {
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000);
                    }).catch(console.error);

                var data = [message.author.id, message.channel.id, message.content, new Date()];
                connection.query('INSERT INTO log_messageremovals (userID, channel, message, timestamp) VALUES (?,?,?,?)', data,
                    function (err, results) {
                        if (err) throw err;
                    }
                );
            }).catch(console.error);
        }
    }
}

exports.checkExpiredMutes = async function checkExpiredMutes(client) {
    const mutedFile = client.mutedFile;
    const config = client.config;
    const guild = client.guilds.get(config.guildid);
    const _ = client.underscore;
    var mutes = mutedFile.read();
    for (key in mutes) {
        if (mutes[key].end < Math.floor(Date.now() / 1000)) {
            var actionee = guild.member(key);
            var mutedRole = guild.roles.find(val => val.name === 'Muted');

            if (actionee) {
                actionee.removeRole(mutedRole).then(async member => {
                    await guild.channels.get(config.channel_serverlog).send(`${member} has been unmuted`);
                    mutedFile.unset(key);
                    await mutedFile.save();
                }).catch(console.error);
            } else {
                console.log(`Actionee could not be found ${key}`);
                mutedFile.unset(key);
                await mutedFile.save();
            }
        }
    }
}

exports.checkReminders = async function checkReminders(client) {
    const config = client.config;
    const reminderFile = client.reminderFile;
    const _ = client.underscore;
    var guild = client.guilds.get(config.guildid);
    var reminders = reminderFile.read();

    for (key in reminders) {
        var current = reminders[key];
        if (current.end < Math.floor(Date.now() / 1000)) {
            var member = guild.member(current.who);
            var time = current.length;
            var unit = time.replace(/[0-9]+/g, ``);
            time = time.replace(/[a-z]$/i, ``);
            switch (unit) {
                case `m`:
                    if (parseInt(time) == 1) unit = `minute`;
                    else unit = `minutes`;
                    break;
                case `h`:
                    if (parseInt(time) == 1) unit = `hour`;
                    else unit = `hours`;
                    break;
                case `d`:
                    if (parseInt(time) == 1) unit = `day`;
                    else unit = `days`;
                    break;
                default:
                    if (parseInt(time) == 1) unit = `hour`;
                    else unit = `hours`;
            }
            if (member) {
                await member.createDM().then(async chnl => {
                    await chnl.send({
                        embed: {
                            color: config.color_info,
                            author: {
                                name: client.user.username,
                                icon_url: client.user.displayAvatarURL
                            },
                            title: `You set a reminder ${time} ${unit} ago.`,
                            description: current.reminder,
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                            }
                        }
                    });
                }).catch(console.error);
            }
            reminderFile.unset(key);
            await reminderFile.save();
        }
    }   
}

exports.importWarnings = function importWarnings(client) {
    const connection = client.connection;
    const usercardsFile = client.usercardsFile;
    const cryptoRandomString = client.cryptoRandomString;
    var warnings = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < warnings.length; i++) {
        if (warnings[i].Records.length > 0) {
            var userID = warnings[i].DiscordId.$numberLong;
            for (var a = 0; a < warnings[i].Records.length; a++) {
                if (warnings[i].Records[a]._t[1] == 'WarnRecord') {
                    insert.push([userID, warnings[i].Records[a].AddedByUserId.$numberLong, warnings[i].Records[a].Reason,
                    cryptoRandomString({ length: 10 }), 0, warnings[i].Records[a].ActionTaken.$date, new Date()]);
                }
            }
        }
    }

    connection.query('INSERT IGNORE INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?', [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

exports.importMutes = function importMutes(client) {
    const usercardsFile = client.usercardsFile;
    const connection = client.connection;
    const cryptoRandomString = client.cryptoRandomString;
    var mutes = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < mutes.length; i++) {
        if (mutes[i].Records.length > 0) {
            var userID = mutes[i].DiscordId.$numberLong;
            for (var a = 0; a < mutes[i].Records.length; a++) {
                if (mutes[i].Records[a]._t[1] == 'MuteRecord') {
                    var split;
                    var seconds = 0;
                    split = mutes[i].Records[a].Duration.split(':');

                    for (var b = 0; b < 3; b++) {
                        let int;
                        if (split[b] == '00') {
                            int = 0;
                        } else {
                            int = parseInt(split[b]);
                        }
                        if (b == 0) {
                            seconds += int * 60 * 60;
                        } else if (b == 1) {
                            seconds += int * 60;
                        } else if (b == 2) {
                            seconds += int;
                        } else {
                            return;
                        }
                    }
                    insert.push([userID, mutes[i].Records[a].AddedByUserId.$numberLong, mutes[i].Records[a].Reason,
                    seconds, cryptoRandomString({ length: 10 }), 0, mutes[i].Records[a].ActionTaken.$date, new Date()]);
                }
            }
        }
    }

    connection.query('INSERT IGNORE INTO log_mutes (userID, actioner, description, length, identifier, isDeleted, timestamp, updated) VALUES ?', [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

exports.importNotes = function importNotes(client) {
    const usercardsFile = client.usercardsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    var notes = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < notes.length; i++) {
        if (notes[i].Notes.length > 0) {
            var userID = notes[i].DiscordId.$numberLong;
            for (var a = 0; a < notes[i].Notes.length; a++) {
                insert.push([userID, notes[i].Notes[a].AddedByUserId.$numberLong, notes[i].Notes[a].Message,
                cryptoRandomString({ length: 10 }), 0, notes[i].Notes[a].ActionTaken.$date, new Date()]);
            }
        }
    }

    connection.query( 'INSERT IGNORE INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?', [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

exports.importBans = function importBans(client) {
    const usercardsFile = client.usercardsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    var bans = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < bans.length; i++) {
        if (bans[i].Records.length > 0) {
            var userID = bans[i].DiscordId.$numberLong;
            for (var a = 0; a < bans[i].Records.length; a++) {
                if (bans[i].Records[a]._t[1] == 'BanRecord') {
                    insert.push([userID, bans[i].Records[a].AddedByUserId.$numberLong, bans[i].Records[a].Reason,
                    cryptoRandomString({ length: 10 }), 0, bans[i].Records[a].ActionTaken.$date, new Date()]);
                }
            }
        }
    }

    connection.query('INSERT IGNORE INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?', [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

exports.importUnbans = function importUnbans(client) {
    const usercardsFile = client.usercardsFile;
    const cryptoRandomString = client.cryptoRandomString;
    const connection = client.connection;
    var unbans = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < unbans.length; i++) {
        if (unbans[i].Records.length > 0) {
            var userID = unbans[i].DiscordId.$numberLong;
            for (var a = 0; a < unbans[i].Records.length; a++) {
                if (unbans[i].Records[a]._t[1] == 'UnbanRecord') {
                    insert.push([userID, unbans[i].Records[a].AddedByUserId.$numberLong, unbans[i].Records[a].Reason,
                    cryptoRandomString({ length: 10 }), 0, unbans[i].Records[a].ActionTaken.$date, new Date()]);
                }
            }
        }
    }

    connection.query('INSERT IGNORE INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?', [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

exports.checkStreamers = function checkStreamers(client) {
    const guild = client.guilds.get(client.config.guildid);
    var streamerRole = guild.roles.find(r => r.name == 'Streamers');
    var spotlightRole = guild.roles.find(r => r.name == 'Streamer Spotlight');
    var streamers = guild.members.filter(m => m.roles.has(streamerRole.id) && !m.roles.has(spotlightRole.id));
    var spotlighters = guild.members.filter(m => m.roles.has(spotlightRole.id));
    streamers.forEach(s => {
        if (s.user.presence.status != 'offline' && s.user.presence.game && /.*twitch\.tv.*/.test(s.user.presence.game.url) && s.user.presence.game.details == 'PLAYERUNKNOWN\'S BATTLEGROUNDS') {
            s.addRole(spotlightRole);
        }
    });
    spotlighters.forEach(s => {
        if (s.user.presence.status == 'offline' || !s.user.presence.game || !(/.*twitch.tv.*/.test(s.user.presence.game.url)) || s.user.presence.game.details != 'PLAYERUNKNOWN\'S BATTLEGROUNDS') {
            s.removeRole(spotlightRole);
        }
    });
}

exports.setReactionRoles = async function setReactionRoles (client) {
    const guild = client.guilds.get(client.config.guildid);
    const reactionsFile = client.reactionsFile;
    const reactionsObject = reactionsFile.read();
    for (cKey in reactionsObject) {
        var chnl = guild.channels.get(cKey);
        if (chnl) {
            const channelsObject = reactionsObject[cKey];
            for (mKey in channelsObject) {
                try {
                    var msg = await chnl.fetchMessage(mKey);
                } catch (e) {}
                if (msg) {
                    const messagesObjecct = channelsObject[mKey];
                    for (rKey in messagesObjecct) {
                        if (/[0-9]+/.test(rKey)) var emoji = client.emojis.get(rKey);
                        else var emoji = rKey;
                        if (emoji) {
                            const roleId = messagesObjecct[rKey];
                            var role = guild.roles.get(roleId);
                            if (role) {
                                await msg.react(emoji);
                            } else {
                                reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                                reactionsFile.save();
                            }
                        } else {
                            reactionsFile.unset(`${cKey}.${mKey}.${rKey}`);
                            reactionsFile.save();
                        }
                    }
                } else {
                    reactionsFile.unset(`${cKey}.${mKey}`);
                    reactionsFile.save();
                }
            }
        } else {
            reactionsFile.unset(`${cKey}`);
            reactionsFile.save();
        }
    }
}