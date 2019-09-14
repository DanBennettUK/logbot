``;
/*
#############################################################
##             Logger - Marvin's Younger Brother           ##
##            Created and maintained by Sys#1602           ##
##                                                         ##
##             Another big thanks to MrSergo15#0015        ##
##                                                         ##
##       with ♡ from all those at /r/PUBATTLEGROUNDS       ##
#############################################################
*/
const Discord = require('discord.js');

var guild;
const bfj = require('bfj');
const mysql = require('mysql2');
var moment = require('moment');
const client = new Discord.Client();
const Store = require('data-store');
var _ = require('underscore');
const config = require('./config.json');
const editJsonFile = require('edit-json-file');
var modules = require('./modules.json');
const changelog = require('./changelog.json');
const antispam = require('discord-anti-spam');
var stringSimilarity = require('string-similarity');
const cryptoRandomString = require('crypto-random-string');

var modulesFile = editJsonFile('./modules.json');

var bannedUsers = require('./banned_users.json');
var bannedUsersFile = editJsonFile('./banned_users.json');
var badWordsFile = editJsonFile(`./bad_words.json`);
var mutedFile = editJsonFile('./muted.json');
var reminderFile = editJsonFile('./reminders.json');
var usercardsFile = editJsonFile('./usercards.json');
var customCommands = editJsonFile('./customCommands.json');
var LFGRoomsFile = editJsonFile('./LFGRooms.json');

const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: config.multipleStatements
});
connection.connect(function (err, results) {
    if (err) throw err;
});

function setupTables() {
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

function parseUserTag(tag) {
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
        var usernameResolve = client.users.find(
            obj => obj.username === split[0]
        );

        if (usernameResolve == null) return 'err';
        if (usernameResolve.discriminator == split[1]) {
            return usernameResolve.id;
        } else {
            return 'err';
        }
    } else if (/^[0-9]+$/.test(tag)) {
        return trimMe;
    } else {
        var usernameResolve = client.users.find(obj => obj.username === tag);
        var nicknameResolve = client.users.find(obj => obj.nickname === tag);

        if (usernameResolve) {
            return usernameResolve.id;
        } else if (nicknameResolve) {
            return nicknameResolve.id;
        } else {
            return 'err';
        }
    }
}

function parseChannelTag(tag) {
    /*
  - Function used for parsing multiple types of the <channel> argument

  returns @id <int>
  */
    var trimMe = tag.trim();

    if (/(<#(!)*)+\w+(>)/.test(tag)) {
        return trimMe.replace(/[^0-9.]/gi, '');
    } else if (/^[0-9]+$/.test(tag)) {
        return trimMe;
    } else {
        return 'err';
    }
}

function updateUserTable(invoker, channel) {
    var memberArray = [];
    var guild = client.guilds.get(config.guildid);

    guild.fetchMembers().then(r => {
        r.members.array().forEach(r => {
            memberArray.push([
                r.user.id,
                r.user.username,
                r.user.avatar,
                1,
                r.joinedAt
            ]);
        });
        connection.query(
            'INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES ?',
            [memberArray],
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
                                        text: `Marvin's Little Brother | Current version: ${
                                            config.version
                                        }`
                                    }
                                }
                            });
                            break;
                        case 'system':
                            console.log(
                                `[INFO] Found ${memberArray.length} users.`
                            );
                            break;
                    }
                }
            }
        );
    });
}

function updateGuildBansTable(invoker, channel) {
    var banArray = [];
    var guild = client.guilds.get(config.guildid);

    guild.fetchBans().then(bans => {
        bans.array().forEach(ban => {
            banArray.push([
                ban.id,
                ban.username,
                ban.discriminator,
                '001',
                null,
                'Ban added via a call to updateGuildBansTable',
                new Date()
            ]);
        });
        connection.query(
            'INSERT IGNORE INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, timestamp) VALUES ?',
            [banArray],
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
                                        text: `Marvin's Little Brother | Current version: ${
                                            config.version
                                        }`
                                    }
                                }
                            });
                            break;
                        case 'system':
                            console.log(
                                '[INFO] Found ' +
                                banArray.length +
                                ' bans / Inserted ' +
                                results.affectedRows +
                                ' rows. Bans that are not in the database will be added now. '
                            );
                            break;
                    }
                }
            }
        );
    });
}

function syntaxErr(message, command) {
    message.channel
        .send(`There is a problem in your syntax.`)
        .then(msg => {
            setTimeout(async () => {
                await message.delete();
                await msg.delete();
            }, 7000);
        })
        .catch(console.error);
}

function isNull(value, def) {
    if (!value || (value === undefined || value === null)) {
        return def;
    } else {
        return value;
    }
}

function checkMessageContent(message) {
    if (message.member.roles.some(role => ['Moderators'].includes(role.name)))
        return;
    var wholeMessage = message.content.split(' ');
    var badWordList = badWordsFile.get(`badWords`);
    if (badWordList == undefined) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
        return;
    }
    if (badWordList.length > 0) {
        if (badWordList.some(word => wholeMessage.includes(word))) {
            message
                .delete()
                .then(() => {
                    message.channel
                        .send(`${message.author} watch your language`)
                        .then(msg => {
                            setTimeout(async () => {
                                await msg.delete();
                            }, 5000);
                        })
                        .catch(console.error);

                    var data = [
                        message.author.id,
                        message.channel.id,
                        message.content,
                        new Date()
                    ];
                    connection.query(
                        'INSERT INTO log_messageremovals (userID, channel, message, timestamp) VALUES (?,?,?,?)',
                        data,
                        function (err, results) {
                            if (err) throw err;
                        }
                    );
                })
                .catch(console.error);
        }
    }
}

function checkExpiredMutes() {
    var mutes = mutedFile.read();
    var muteKeys = _.keys(mutes);

    for (var a = 0; a < muteKeys.length; a++) {
        let key = muteKeys[a];
        if (mutes[key].end < Math.floor(Date.now() / 1000)) {
            var actionee = guild.member(key);
            var mutedRole = guild.roles.find(val => val.name === 'Muted');

            if (actionee) {
                actionee
                    .removeRole(mutedRole)
                    .then(member => {
                        guild.channels
                            .find(val => val.name === 'server-log')
                            .send(`${member} has been unmuted`);
                        mutedFile.unset(key);
                        mutedFile.save();
                    })
                    .catch(console.error);
            } else {
                console.log(`Actionee could not be found ${key}`);
                mutedFile.unset(key);
                mutedFile.save();
            }
        }
    }
}

function checkReminders() {
    var guild = client.guilds.get(config.guildid);
    var reminders = reminderFile.read();
    var reminderKeys = _.keys(reminders);

    var a = 0;

    function loop() {
        setTimeout(function () {
            var current = reminderFile.get(reminderKeys[a]);
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
                    member
                        .createDM()
                        .then(chnl => {
                            chnl.send({
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
                                        text: `Marvin's Little Brother | Current version: ${
                                            config.version
                                        }`
                                    }
                                }
                            });
                        })
                        .catch(console.error);
                }
                reminderFile.unset(reminderKeys[a]);
                reminderFile.save();
            }
            a++;
            if (a < reminderKeys.length) {
                loop();
            }
        }, 100);
    }
    loop();
}

function importWarnings() {
    var warnings = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < warnings.length; i++) {
        if (warnings[i].Records.length > 0) {
            var userID = warnings[i].DiscordId.$numberLong;
            for (var a = 0; a < warnings[i].Records.length; a++) {
                if (warnings[i].Records[a]._t[1] == 'WarnRecord') {
                    insert.push([
                        userID,
                        warnings[i].Records[a].AddedByUserId.$numberLong,
                        warnings[i].Records[a].Reason,
                        cryptoRandomString({
                            length: 10
                        }),
                        0,
                        warnings[i].Records[a].ActionTaken.$date,
                        new Date()
                    ]);
                }
            }
        }
    }

    connection.query(
        'INSERT IGNORE INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?',
        [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

function importMutes() {
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
                    insert.push([
                        userID,
                        mutes[i].Records[a].AddedByUserId.$numberLong,
                        mutes[i].Records[a].Reason,
                        seconds,
                        cryptoRandomString({
                            length: 10
                        }),
                        0,
                        mutes[i].Records[a].ActionTaken.$date,
                        new Date()
                    ]);
                }
            }
        }
    }

    connection.query(
        'INSERT IGNORE INTO log_mutes (userID, actioner, description, length, identifier, isDeleted, timestamp, updated) VALUES ?',
        [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

function importNotes() {
    var notes = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < notes.length; i++) {
        if (notes[i].Notes.length > 0) {
            var userID = notes[i].DiscordId.$numberLong;
            for (var a = 0; a < notes[i].Notes.length; a++) {
                insert.push([
                    userID,
                    notes[i].Notes[a].AddedByUserId.$numberLong,
                    notes[i].Notes[a].Message,
                    cryptoRandomString({
                        length: 10
                    }),
                    0,
                    notes[i].Notes[a].ActionTaken.$date,
                    new Date()
                ]);
            }
        }
    }

    connection.query(
        'INSERT IGNORE INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?',
        [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

function importBans() {
    var bans = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < bans.length; i++) {
        if (bans[i].Records.length > 0) {
            var userID = bans[i].DiscordId.$numberLong;
            for (var a = 0; a < bans[i].Records.length; a++) {
                if (bans[i].Records[a]._t[1] == 'BanRecord') {
                    insert.push([
                        userID,
                        bans[i].Records[a].AddedByUserId.$numberLong,
                        bans[i].Records[a].Reason,
                        cryptoRandomString({
                            length: 10
                        }),
                        0,
                        bans[i].Records[a].ActionTaken.$date,
                        new Date()
                    ]);
                }
            }
        }
    }

    connection.query(
        'INSERT IGNORE INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?',
        [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

function importUnbans() {
    var unbans = usercardsFile.get();
    var insert = [];

    for (var i = 0; i < unbans.length; i++) {
        if (unbans[i].Records.length > 0) {
            var userID = unbans[i].DiscordId.$numberLong;
            for (var a = 0; a < unbans[i].Records.length; a++) {
                if (unbans[i].Records[a]._t[1] == 'UnbanRecord') {
                    insert.push([
                        userID,
                        unbans[i].Records[a].AddedByUserId.$numberLong,
                        unbans[i].Records[a].Reason,
                        cryptoRandomString({
                            length: 10
                        }),
                        0,
                        unbans[i].Records[a].ActionTaken.$date,
                        new Date()
                    ]);
                }
            }
        }
    }

    connection.query(
        'INSERT IGNORE INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp, updated) VALUES ?',
        [insert],
        function (err, results) {
            if (err) throw err;
            if (results) {
                console.log('Success!');
            }
        }
    );
}

client.on('ready', () => {
    setupTables();

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

    updateUserTable('system', null);
    guild = client.guilds.get(config.guildid);

    setInterval(checkExpiredMutes, 10000);
    setInterval(checkReminders, 15000);
});

client.on('message', async message => {
    if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    if (_.indexOf(['dm', 'group'], message.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.

    //Log every message that is processed; message or command.
    var data = [
        message.author.id,
        message.id,
        message.content,
        '',
        message.channel.id,
        1,
        new Date()
    ];
    connection.query(
        'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)',
        data,
        function (err, results) {
            if (err) throw err;
        }
    );

    if (modulesFile.get('EVENT_CHECKMESSAGECONTENT')) {
        checkMessageContent(message);
    }

    if (message.content.indexOf(config.prefix) !== 0) return; //If the message content doesn't start with our prefix, return.

    if (!(_.keys(badWordsFile.read()).length > 0)) {
        badWordsFile.set(`badWords`, []);
        badWordsFile.save();
    }

    const args = message.content
        .slice(1)
        .trim()
        .split(/\s+/); //Result: ["<TAG>", "Bad", "person!"]
    const command = args.shift().toLowerCase(); //Result: "ban"

    if (_.keys(customCommands.read()).includes(command)) {
        var obj = customCommands.get(command);
        if (obj.end < Math.floor(Date.now() / 1000)) {
            message.channel.send(`${obj.content}`);
            message.delete();
            customCommands.set(
                `${command}.end`,
                Math.floor(Date.now() / 1000) + obj.cooldown
            );
            customCommands.save();
        }
    }

    //fun commands
    if (command === 'flipacoin') {
        if (modulesFile.get('COMMAND_FLIPACOIN')) {
            var outcome = Math.floor(Math.random() * Math.floor(2));

            switch (outcome) {
                case 0:
                    message.channel.send('Heads!');
                    break;
                case 1:
                    message.channel.send('Tails!');
                    break;
            }
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
    if (command === 'ask') {
        if (
            message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_ASK')) {
                var query = args.join('+');
                var request = require('request');
                var answer;
                request(
                    'https://api.duckduckgo.com/?q=' + query + '&format=json',
                    function (error, response, body) {
                        answer = JSON.parse(body);
                        if (answer.Abstract == '') {
                            if (answer.RelatedTopics.length > 0) {
                                if (answer.RelatedTopics[0].text != '') {
                                    message.channel.send(
                                        answer.RelatedTopics[0].Text
                                    );
                                } else
                                    message.channel.send('No results found.');
                            } else message.channel.send('No results found.');
                        } else {
                            message.channel.send(answer.Abstract);
                        }
                    }
                );
            }
        } // End of permission checking statement
    }
    if (command === 'roll') {
        if (modulesFile.get('COMMAND_ROLL')) {
            var outcome = 0;
            while (outcome == 0) {
                outcome = Math.floor(Math.random() * Math.floor(101));
            }
            message.channel.send('Your random roll is ' + outcome + '!');
        } else {
            message.channel.send(`That module (${command}) is disabled.`);
        }
    }
  
    //utility commands
    if (command === 'module') {
        if (
            message.member.roles.some(role => ['Admins', 'Full Mods'].includes(role.name))
        ) {
            if (typeof modulesFile.get(args[0].toUpperCase()) != 'undefined') {
                //Checks if the module provided exists
                if ([0, 1].includes(parseInt(args[1]))) {
                    //Parses the string as an int, then checks if the result is a valid <Int> & it's either a 0 or 1
                    modulesFile.set(args[0].toUpperCase(), parseInt(args[1]));
                    modulesFile.save();

                    message.channel.send({
                        embed: {
                            color: config.color_info,
                            title: '🔶 A module was updated',
                            description: args[0].toUpperCase() + ' was set to status ' + args[1],
                            timestamp: new Date(),
                            footer: {
                                text: `Marvin's Little Brother | Current version: ${
                                    config.version
                                }`
                            }
                        }
                    });
                } else {
                    message.channel
                        .send(`Please provide a valid status\n\nOff: 0\nOn: 1`)
                        .then(msg => {
                            setTimeout(async () => {
                                await msg.delete();
                                await message.delete();
                            }, 6000);
                        })
                        .catch(console.error);
                }
            } else {
                message.channel.send(
                    'That module was not found. Consider using >listmodules'
                );
            }
        } //End of permission checking statement
    }

    if (command === 'listmodules') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            var file = modulesFile.get();
            var moduleNames = _.keys(file);
            var moduleValues = _.values(file);

            message.channel.send({
                embed: {
                    color: config.color_info,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.displayAvatarURL
                    },
                    title: '[COMMAND] List Modules',
                    fields: [{
                            name: 'Module',
                            value: moduleNames.join('\n'),
                            inline: true
                        },
                        {
                            name: 'State',
                            value: moduleValues.join('\n'),
                            inline: true
                        },
                        {
                            name: 'Note',
                            value: 'If you would like a module enabling/disabling. Please ask an Admin.'
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${
                            config.version
                        }`
                    }
                }
            });
        } //End of permission checking statement
    }

    if (command === 'users') {
        if (args[0].toLowerCase() == 'count') {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
                if (modulesFile.get('COMMAND_USER_COUNT')) {
                    connection.query(
                        'SELECT COUNT(*) AS TotalUsers FROM users',
                        function (err, result) {
                            if (err) throw err;
                            if (result)
                                message.channel.send({
                                    embed: {
                                        color: config.color_info,
                                        author: {
                                            name: client.user.username,
                                            icon_url: client.user.displayAvatarURL
                                        },
                                        title: '[COMMAND] User count',
                                        description: 'The current count of users known to us',
                                        fields: [{
                                                name: 'Total user count',
                                                value: result[0].TotalUsers
                                            },
                                            {
                                                name: 'Note',
                                                value: 'This number includes users past and present.'
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${
                                                config.version
                                            }`
                                        }
                                    }
                                });
                        }
                    );
                } else {
                    message.channel.send(
                        `That module (${command}) is disabled.`
                    );
                }
            } //End of permission checking statement
        }
        if (args[0].toLowerCase() == 'update') {
            if (
                message.member.roles.some(role => ['Admins'].includes(role.name))
            ) {
                if (modulesFile.get('COMMAND_USER_UPDATE')) {
                    updateUserTable('user', message.channel.id);
                } else {
                    message.channel.send(
                        `That module (${command}) is disabled.`
                    );
                }
            }
        }
    }

    if(command === 'ban'){
        if(message.member.roles.some(role=>['Moderators'].includes(role.name))){
          if(modulesFile.get('COMMAND_BAN')){
            if(args[0]){
              var user = parseUserTag(args[0]);
    
              if(user == 'err'){ //Check if the user parameter is valid
                message.channel.send('An invalid user was provided. Please try again');
              } else {
                if (guild.member(user)) { //Check if the user exists in the guild
                  if(message.member.highestRole.comparePositionTo(guild.member(user).highestRole) > 0) {
                    var tail = args.slice(1);
                    var reason = tail.join(" ").trim();
    
                    if(tail.length > 0){
                      var identifier = cryptoRandomString({length: 10});
                      client.users.get(user).createDM().then(async chnl => {
                        await chnl.send({embed: {
                              color: config.color_warning,
                              title:`You have been banned from ${guild.name} for breaking one or more of the rules` ,
                              fields: [
                                {
                                  name: 'Want to dispute?',
                                  value: `This ban can be disputed reasonably by contacting us via our subreddit modmail using the link below\n\n <https://www.reddit.com/message/compose?to=/r/PUBATTLEGROUNDS&subject=[${identifier}]%20Discord%20Ban%20Appeal&message=[Please%20use%20this%20message%20box%20to%20explain%20your%20side%20of%20the%20ban,%20including%20any%20evidence.%20Please%20do%20not%20change%20the%20subject%20of%20this%20message.]>`
                                }
                              ],
                              timestamp: new Date(),
                              footer: {
                                text: `Marvin's Little Brother | Current version: ${config.version}`
                              }
                            }
                        }).then(dm => {
                          var data = [user, `Title: ${dm.embeds[0].title}`, 2, 0, identifier, new Date(), new Date()];
                          connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data, function(err, results){if(err) throw err;})
    
                          guild.ban(user, { days: 1, reason: reason }).then(async result => {
                              await message.channel.send({embed: {
                                    color: config.color_success,
                                    author: {
                                      name: client.user.username,
                                      icon_url: client.user.displayAvatarURL
                                    },
                                    title: '[Action] Ban',
                                    description: `${client.users.get(user)} has been successfully banned`,
                                    fields: [{
                                        name: 'User ID',
                                        value: result.id,
                                        inline: true
                                      },
                                      {
                                        name: 'Username/Discrim',
                                        value: `${result.username}#${result.discriminator}`,
                                        inline: true
                                      },
                                      {
                                        name: 'Reason',
                                        value: reason
                                      },
                                      {
                                        name: 'Banned by',
                                        value: message.author.username
                                      },
                                      {
                                        name: 'Identifier',
                                        value: identifier
                                      },
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                      text: `Marvin's Little Brother | Current version: ${config.version}`
                                    }
                                  }
                              });
    
                              var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                              connection.query(
                                'INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                function(err, results){
                                  if(err) throw err;
                                }
                              );
    
                              //Adding the user to our banned users JSON
                              bannedUsersFile.set(identifier, result.username);
                              bannedUsersFile.save();
                            })
                            .catch(console.error);
                        });
                      }).catch(console.error);
                    }
                    else {
                      message.channel.send('Please provide a reason for the ban');
                    }
                  } else message.channel.send('You can not ban a user with a higher role than yourself');
                } else { // if the user isn't in the guild, have a confirmation message and proceed upon reacting
                  if (client.fetchUser(user)) {
                    await client.fetchUser(user).then(async userObj =>{
    
                      await message.channel.send(`User ${userObj} is not in the guild. Are you sure you want to proceed?`)
                      .then(async msg => {
                        await msg.react('✅');
                        await msg.react('❌');
    
                        const filter = (reaction, user) => user == message.member.user;
                        const collector = msg.createReactionCollector(filter);
                        
                        collector.on('collect', async react => {
                          if (react.emoji.name == '✅') {
                            await msg.delete();
                            var tail = args.slice(1);
                            var reason = tail.join(" ").trim();
    
                            if (tail.length > 0) {
                              var identifier = cryptoRandomString({length: 10});
                              guild.ban(user, { days: 1, reason: reason }).then(async result => {
                                await message.channel.send({embed: {
                                      color: config.color_success,
                                      author: {
                                        name: client.user.username,
                                        icon_url: client.user.displayAvatarURL
                                      },
                                      title: '[Action] Ban' ,
                                      description: `${client.users.get(user)} has been successfully banned`,
                                      fields: [{
                                          name: 'User ID',
                                          value: result.id,
                                          inline: true
                                        },
                                        {
                                          name: 'Username/Discrim',
                                          value: `${result.username}#${result.discriminator}`,
                                          inline: true
                                        },
                                        {
                                          name: 'Reason',
                                          value: reason
                                        },
                                        {
                                          name: 'Banned by',
                                          value: message.author.username
                                        },
                                        {
                                          name: 'Identifier',
                                          value: identifier
                                        },
                                      ],
                                      timestamp: new Date(),
                                      footer: {
                                        text: `Marvin's Little Brother | Current version: ${config.version}`
                                      }
                                    }
                                });
                                var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                                connection.query(
                                  'INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                                  function(err, results){
                                    if(err) throw err;
                                  }
                                );
    
                                //Adding the user to our banned users JSON
                                bannedUsersFile.set(identifier, result.username);
                                bannedUsersFile.save();
                              }).catch(console.error);
                            }
                          } 
                          if (react.emoji.name == '❌') {
                            await msg.delete();
                            message.channel.send('Action cancelled').then(msg2 => {
                              setTimeout(function() {msg2.delete();}, 5000);
                            });
                          }
                        });
                      });
                    });
                  }        
                }
              }
            } else {
              syntaxErr(message, 'ban');
              return;
            }
          } else {
            message.channel.send(`That module (${command}) is disabled.`);;
          }
        }
      }

    if (command === 'unban') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_UNBAN')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    message.channel.send(
                        'Unban who?\n Format:`>unban <UserTag> <Reason>`'
                    );
                    return;
                }

                if (user == 'err') {
                    //Check if the user parameter is valid
                    message.channel.send(
                        ':thinking: An invalid user was provided. Please try again'
                    );
                } else {
                    if (client.fetchUser(user)) {
                        var tail = args.slice(1);
                        var reason = tail.join(' ').trim();

                        if (tail.length > 0) {
                            guild
                                .unban(user, reason)
                                .then(result => {
                                    var identifier = cryptoRandomString({
                                        length: 10
                                    });
                                    message.channel.send({
                                        embed: {
                                            color: config.color_success,
                                            author: {
                                                name: client.user.username,
                                                icon_url: client.user.displayAvatarURL
                                            },
                                            title: `[Action] Unban`,
                                            description: 'The user provided has been successfully unbanned',
                                            fields: [{
                                                    name: 'ID',
                                                    value: result.id,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Username/Discrim',
                                                    value: `${
                                                        result.username
                                                    }#${result.discriminator}`,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Reason',
                                                    value: reason
                                                },
                                                {
                                                    name: 'Unbanned by',
                                                    value: message.author.username
                                                },
                                                {
                                                    name: 'Identifier',
                                                    value: identifier
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    });

                                    var data = [
                                        result.id,
                                        message.author.id,
                                        reason,
                                        identifier,
                                        0,
                                        new Date()
                                    ];
                                    connection.query(
                                        'INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)',
                                        data,
                                        function (err, results) {
                                            if (err) throw err;
                                        }
                                    );
                                    connection.query(
                                        'select identifier from log_guildbans where userid = ? order by timestamp desc limit 1',
                                        result.id,
                                        function (err, rows, results) {
                                            if (err) throw err;

                                            //var file = bannedUsersFile.get();
                                            bannedUsersFile.set(
                                                rows[0].identifier,
                                                ''
                                            );
                                            bannedUsersFile.save();
                                        }
                                    );
                                })
                                .catch(err => {
                                    if (err.message === 'Unknown Ban') {
                                        message.channel.send(
                                            "That user doesn't appear to be banned"
                                        );
                                    } else {
                                        console.log(err);
                                    }
                                });
                        } else {
                            message.channel.send(
                                'Please provide a reason for the unban'
                            );
                        }
                    } else {
                        message.channel.send(
                            'Could not find a Discord user with that tag/ID'
                        );
                    }
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'note') {
        if (
            message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_NOTE')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    message.channel.send(
                        'Format: `>note [User ID] [Note content]`'
                    );
                    return;
                }

                if (user == 'err') {
                    message.channel.send(
                        'An invalid user was provided. Please try again'
                    );
                } else {
                    var tail = args.slice(1);
                    var note = tail.join(' ').trim();

                    if (tail.length > 0) {
                        var identifier = cryptoRandomString({
                            length: 10
                        });
                        var data = [
                            user,
                            message.author.id,
                            note,
                            identifier,
                            0,
                            new Date(),
                            user
                        ];
                        connection.query(
                            'INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)',
                            data,
                            function (err, results) {
                                if (err) throw err;

                                message.channel.send({
                                    embed: {
                                        color: config.color_success,
                                        author: {
                                            name: client.user.username,
                                            icon_url: client.user.displayAvatarURL
                                        },
                                        title: '[Action] Note added',
                                        description: `A note was added to ${client.users.get(
                                            user
                                        )} by ${message.author}`,
                                        fields: [{
                                                name: 'Content',
                                                value: note
                                            },
                                            {
                                                name: 'Identifier',
                                                value: identifier
                                            }
                                        ],
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${
                                                config.version
                                            }`
                                        }
                                    }
                                });
                            }
                        );
                    } else {
                        message.channel.send('The note needs a reason!');
                    }
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'cnote') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_CNOTE')) {
                if (args[0].length == 10) {
                    connection.query(
                        'UPDATE log_note SET isDeleted = 1 WHERE identifier = ?',
                        args[0].trim(),
                        function (err, results, rows) {
                            if (err) throw err;
                            if (results.affectedRows == 1) {
                                message.channel.send(
                                    `☑ Note with id \`${args[0].trim()}\` was successfully cleared.`
                                );
                            } else {
                                message.channel
                                    .send(
                                        `A note with that ID could not be found`
                                    )
                                    .then(msg => {
                                        setTimeout(async () => {
                                            await msg.delete();
                                            await message.delete();
                                        }, 6000);
                                    })
                                    .catch(console.error);
                            }
                        }
                    );
                } else {
                    syntaxErr(message, 'cnote');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'user') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_USER')) {
                var userID = parseUserTag(args[0]);
                var globalUser = client.users.get(userID);
                var userObject = guild.member(globalUser);

                if (userObject) {
                    var nickname;
                    var voiceChannel;
                    var app;

                    if (userObject.user.displayName) {
                        nickname = userObject.user.displayName;
                    } else {
                        nickname = 'No nickname';
                    }
                    if (userObject.voiceChannel) {
                        voiceChannel = userObject.voiceChannel.name;
                    } else {
                        voiceChannel = 'Not in a voice channel';
                    }
                    if (userObject.user.presence.game) {
                        app = userObject.user.presence.game.name;
                    } else {
                        app = 'None';
                    }

                    message.channel
                        .send({
                            embed: {
                                color: config.color_info,
                                author: {
                                    name: `${
                                        userObject.user.username
                                    } (${nickname})`,
                                    icon_url: userObject.user.displayAvatarURL
                                },
                                description: `${
                                    userObject.user
                                } joined the guild on ${userObject.joinedAt}`,
                                thumbnail: {
                                    url: userObject.user.displayAvatarURL
                                },
                                fields: [{
                                        name: 'Created',
                                        value: userObject.user.createdAt
                                    },
                                    {
                                        name: 'Status',
                                        value: `${userObject.user.presence.status.toUpperCase()}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Application',
                                        value: `${app}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Voice channel',
                                        value: `${voiceChannel}`
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${
                                        config.version
                                    }`
                                }
                            }
                        })
                        .then(async msg => {
                            await msg.react('👥');
                            await msg.react('👮');
                            await msg.react('🔈');
                            await msg.react('✍');
                            await msg.react('📥');
                            await msg.react('❌');

                            const filter = (reaction, user) =>
                                user.bot == false;
                            const collector = msg.createReactionCollector(
                                filter
                            );

                            collector.on('collect', async r => {
                                if (r.emoji.name == '👮') {
                                    await r.remove(r.users.last());

                                    connection.query(
                                        `
                  (
                  select 'unban' as \`type\`, gub.* from log_guildunbans gub
                    where gub.userid = ${connection.escape(userID)}
                    	and gub.isDeleted = 0
                  union all
                  select 'ban' as \`type\`, gb.* from log_guildbans gb
                    where gb.userid = ${connection.escape(userID)}
                  	 and gb.isDeleted = 0
                  	  and gb.actioner <> '001'
                  union all
                  select 'warn' as \`type\`, w.* from log_warn w
                    where w.userid = ${connection.escape(userID)}
                  	 and w.isDeleted = 0
                   )
                  order by timestamp desc
                  `,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var events = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                if (row.type == 'warn') {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` ❗ Warning by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                } else if (row.type == 'ban') {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` ⚔ Banned by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                } else {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` 🛡 Unbanned by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                }
                                                if (i == max - 1 && extra > 0) {
                                                    events.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(events)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Warnings for ${
                                                                userObject.user
                                                                    .username
                                                            } (${nickname})`,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: events.join(
                                                            `\n`
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: userObject.user
                                                                .username,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: `There are no recorded warnings for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '🔈') {
                                    await r.remove(r.users.last());

                                    connection.query(
                                        'select * from log_mutes where userID = ? and isDeleted = 0 order by timestamp desc',
                                        userID,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var mutes = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                await mutes.push(
                                                    `\`${
                                                        row.identifier
                                                    }\` 🔇 Mute by ${client.users.get(
                                                        row.actioner
                                                    )} on ${
                                                        row.timestamp
                                                    } for ${
                                                        row.length
                                                    }s \n \`\`\`${
                                                        row.description
                                                    }\`\`\`\n\n`
                                                );
                                                if (i == max - 1 && extra > 0) {
                                                    mutes.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(mutes)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Mutes for ${
                                                                userObject.user
                                                                    .username
                                                            } (${nickname})`,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: mutes.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: userObject.user
                                                                .username,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: `There are no recorded mutes for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '❌') {
                                    msg.delete();
                                    message.delete();
                                } else if (r.emoji.name == '✍') {
                                    await r.remove(r.users.last());
                                    connection.query(
                                        'select * from log_note where userID = ? and isDeleted = 0 order by timestamp desc',
                                        userID,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var notes = [];
                                            for (
                                                var i = 0; i < rows.length; i++
                                            ) {
                                                var row = rows[i];
                                                await notes.push(
                                                    `\`${
                                                        row.identifier
                                                    }\` 📌 Note by ${client.users.get(
                                                        row.actioner
                                                    )} on ${
                                                        row.timestamp
                                                    } \n \`\`\`${
                                                        row.description
                                                    }\`\`\`\n\n`
                                                );
                                            }
                                            if (!_.isEmpty(notes)) {
                                                msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `${
                                                                userObject.user
                                                                    .username
                                                            } (${nickname})`,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: notes.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: userObject.user
                                                                .username,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: `There are no recorded notes for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '👥') {
                                    await r.remove(r.users.last());
                                    msg.edit({
                                        embed: {
                                            color: config.color_info,
                                            author: {
                                                name: `${
                                                    userObject.user.username
                                                } (${nickname})`,
                                                icon_url: userObject.user
                                                    .displayAvatarURL
                                            },
                                            description: `${
                                                userObject.user
                                            } joined the guild on ${
                                                userObject.joinedAt
                                            }`,
                                            thumbnail: {
                                                url: userObject.user
                                                    .displayAvatarURL
                                            },
                                            fields: [{
                                                    name: 'Created',
                                                    value: userObject.user
                                                        .createdAt
                                                },
                                                {
                                                    name: 'Status',
                                                    value: userObject.user.presence
                                                        .status,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Application',
                                                    value: `${app}`,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Voice channel',
                                                    value: `${voiceChannel}`
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    });
                                } else if (r.emoji.name == '📥') {
                                    await r.remove(r.users.last());
                                    connection.query(
                                        `
                  select Status, timestamp
                  from(select *, 'join' as Status from log_guildjoin where userid = ?
                  union
                  select * , 'leave' as Status from log_guildleave where userid = ?
                  ) a
                  order by timestamp desc`,
                                        [userID, userID],
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var history = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                switch (row.Status) {
                                                    case 'join':
                                                        history.push(
                                                            `📥 ${
                                                                userObject.user
                                                                    .username
                                                            } joined at \`${new Date(
                                                                row.timestamp
                                                            )}\`\n\n`
                                                        );
                                                        break;
                                                    case 'leave':
                                                        history.push(
                                                            `📤 ${
                                                                userObject.user
                                                                    .username
                                                            } left at \`${new Date(
                                                                row.timestamp
                                                            )}\`\n\n`
                                                        );
                                                        break;
                                                }
                                                if (i == max - 1 && extra > 0) {
                                                    history.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(history)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Join/Leave history for ${
                                                                userObject.user
                                                                    .username
                                                            } (${nickname})`,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: history.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: userObject.user
                                                                .username,
                                                            icon_url: userObject.user
                                                                .displayAvatarURL
                                                        },
                                                        description: `There are no join/leave records for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    return;
                                }
                            });
                            //collector.on('end');
                        })
                        .catch(console.error);
                } else if (globalUser) {
                    message.channel
                        .send({
                            embed: {
                                color: config.color_caution,
                                author: {
                                    name: globalUser.username,
                                    icon_url: globalUser.displayAvatarURL
                                },
                                title: `${userID}`,
                                description: `The user you provided is not currently camping in this guild.`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${
                                        config.version
                                    }`
                                }
                            }
                        })
                        .then(async msg => {
                            await msg.react('👥');
                            await msg.react('👮');
                            await msg.react('🔈');
                            await msg.react('✍');
                            await msg.react('📥');
                            await msg.react('❌');

                            const filter = (reaction, user) =>
                                user.bot == false;
                            const collector = msg.createReactionCollector(
                                filter
                            );

                            collector.on('collect', async r => {
                                if (r.emoji.name == '👮') {
                                    await r.remove(r.users.last());

                                    connection.query(
                                        `
                  (
                  select 'unban' as \`type\`, gub.* from log_guildunbans gub
                    where gub.userid = ${connection.escape(userID)}
                    	and gub.isDeleted = 0
                  union all
                  select 'ban' as \`type\`, gb.* from log_guildbans gb
                    where gb.userid = ${connection.escape(userID)}
                  	 and gb.isDeleted = 0
                  	  and gb.actioner <> '001'
                  union all
                  select 'warn' as \`type\`, w.* from log_warn w
                    where w.userid = ${connection.escape(userID)}
                  	 and w.isDeleted = 0
                   )
                  order by timestamp desc
                  `,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var events = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= max) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                if (row.type == 'warn') {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` ❗ Warning by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                } else if (row.type == 'ban') {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` ⚔ Banned by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                } else {
                                                    await events.push(
                                                        `\`${
                                                            row.identifier
                                                        }\` 🛡 Unbanned by ${client.users.get(
                                                            row.actioner
                                                        )} on ${
                                                            row.timestamp
                                                        } \n \`\`\`${
                                                            row.description
                                                        }\`\`\`\n`
                                                    );
                                                }
                                                if (i == max - 1 && extra > 0) {
                                                    events.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(events)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Warnings for ${
                                                                globalUser.username
                                                            }`,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: events.join(
                                                            `\n`
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: globalUser.username,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: `There are no recorded warnings for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '🔈') {
                                    await r.remove(r.users.last());

                                    connection.query(
                                        'select * from log_mutes where userID = ? and isDeleted = 0 order by timestamp desc',
                                        userID,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var mutes = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                await mutes.push(
                                                    `\`${
                                                        row.identifier
                                                    }\` 🔇 Mute by ${client.users.get(
                                                        row.actioner
                                                    )} on ${
                                                        row.timestamp
                                                    } for ${
                                                        row.length
                                                    }s \n \`\`\`${
                                                        row.description
                                                    }\`\`\`\n\n`
                                                );
                                                if (i == max - 1 && extra > 0) {
                                                    mutes.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(mutes)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Mutes for ${
                                                                globalUser.username
                                                            }`,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: mutes.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: globalUser.username,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: `There are no recorded mutes for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '❌') {
                                    msg.delete();
                                    message.delete();
                                } else if (r.emoji.name == '✍') {
                                    await r.remove(r.users.last());
                                    connection.query(
                                        'select * from log_note where userID = ? and isDeleted = 0 order by timestamp desc',
                                        userID,
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var notes = [];
                                            for (
                                                var i = 0; i < rows.length; i++
                                            ) {
                                                var row = rows[i];
                                                await notes.push(
                                                    `\`${
                                                        row.identifier
                                                    }\` 📌 Note by ${client.users.get(
                                                        row.actioner
                                                    )} on ${
                                                        row.timestamp
                                                    } \n \`\`\`${
                                                        row.description
                                                    }\`\`\`\n\n`
                                                );
                                            }
                                            if (!_.isEmpty(notes)) {
                                                msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: globalUser.username,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: notes.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: globalUser.username,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: `There are no recorded notes for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else if (r.emoji.name == '👥') {
                                    await r.remove(r.users.last());
                                    msg.edit({
                                        embed: {
                                            color: config.color_caution,
                                            author: {
                                                name: globalUser.username,
                                                icon_url: globalUser.displayAvatarURL
                                            },
                                            title: `${userID}`,
                                            description: `The user you provided is not currently camping in this guild.`,
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    });
                                } else if (r.emoji.name == '📥') {
                                    await r.remove(r.users.last());
                                    connection.query(
                                        `
                  select Status, timestamp
                  from(select *, 'join' as Status from log_guildjoin where userid = ?
                  union
                  select * , 'leave' as Status from log_guildleave where userid = ?
                  ) a
                  order by timestamp desc`,
                                        [userID, userID],
                                        async function (err, rows, results) {
                                            if (err) throw err;
                                            var history = [];
                                            var max = 5;
                                            var extra;

                                            if (rows.length <= 5) {
                                                max = rows.length;
                                            } else {
                                                extra = rows.length - max;
                                            }

                                            for (var i = 0; i < max; i++) {
                                                var row = rows[i];
                                                switch (row.Status) {
                                                    case 'join':
                                                        history.push(
                                                            `📥 ${
                                                                globalUser.username
                                                            } joined at \`${new Date(
                                                                row.timestamp
                                                            )}\`\n\n`
                                                        );
                                                        break;
                                                    case 'leave':
                                                        history.push(
                                                            `📤 ${
                                                                globalUser.username
                                                            } left at \`${new Date(
                                                                row.timestamp
                                                            )}\`\n\n`
                                                        );
                                                        break;
                                                }
                                                if (i == max - 1 && extra > 0) {
                                                    history.push(
                                                        `...${extra} more`
                                                    );
                                                }
                                            }
                                            if (!_.isEmpty(history)) {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_info,
                                                        author: {
                                                            name: `Join/Leave history for ${
                                                                globalUser.username
                                                            }`,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: history.join(
                                                            ' '
                                                        ),
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            } else {
                                                await msg.edit({
                                                    embed: {
                                                        color: config.color_caution,
                                                        author: {
                                                            name: globalUser.username,
                                                            icon_url: globalUser.displayAvatarURL
                                                        },
                                                        description: `There are no join/leave records for this user`,
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    return;
                                }
                            });
                            //collector.on('end');
                        })
                        .catch(console.error);
                } else {
                    connection.query(
                        'select * from users where userid = ? order by updated desc limit 1',
                        userID,
                        async function (err, rows, results) {
                            var cardUser = rows[0];
                            message.channel
                                .send({
                                    embed: {
                                        color: config.color_caution,
                                        author: {
                                            name: `${cardUser.username}`,
                                            icon_url: `https://cdn.discordapp.com/avatars/${
                                                cardUser.userID
                                            }/${cardUser.avatar}.jpg`
                                        },
                                        title: `${userID}`,
                                        description: `This user could not be resolved. All data will be taken from the database.`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Marvin's Little Brother | Current version: ${
                                                config.version
                                            }`
                                        }
                                    }
                                })
                                .then(async msg => {
                                    await msg.react('👥');
                                    await msg.react('👮');
                                    await msg.react('🔈');
                                    await msg.react('✍');
                                    await msg.react('📥');
                                    await msg.react('❌');

                                    const filter = (reaction, user) =>
                                        user.bot == false;
                                    const collector = msg.createReactionCollector(
                                        filter
                                    );

                                    collector.on('collect', async r => {
                                        if (r.emoji.name == '👮') {
                                            await r.remove(r.users.last());

                                            connection.query(
                                                `
                    (
                    select 'unban' as \`type\`, gub.* from log_guildunbans gub
                      where gub.userid = ${connection.escape(userID)}
                      	and gub.isDeleted = 0
                    union all
                    select 'ban' as \`type\`, gb.* from log_guildbans gb
                      where gb.userid = ${connection.escape(userID)}
                    	 and gb.isDeleted = 0
                    	  and gb.actioner <> '001'
                    union all
                    select 'warn' as \`type\`, w.* from log_warn w
                      where w.userid = ${connection.escape(userID)}
                    	 and w.isDeleted = 0
                     )
                    order by timestamp desc
                    `,
                                                async function (
                                                    err,
                                                    rows,
                                                    results
                                                ) {
                                                    if (err) throw err;
                                                    var events = [];
                                                    var max = 5;
                                                    var extra;

                                                    if (rows.length <= max) {
                                                        max = rows.length;
                                                    } else {
                                                        extra =
                                                            rows.length - max;
                                                    }

                                                    for (
                                                        var i = 0; i < max; i++
                                                    ) {
                                                        var row = rows[i];
                                                        if (
                                                            row.type == 'warn'
                                                        ) {
                                                            await events.push(
                                                                `\`${
                                                                    row.identifier
                                                                }\` ❗ Warning by ${client.users.get(
                                                                    row.actioner
                                                                )} on ${
                                                                    row.timestamp
                                                                } \n \`\`\`${
                                                                    row.description
                                                                }\`\`\`\n`
                                                            );
                                                        } else if (
                                                            row.type == 'ban'
                                                        ) {
                                                            await events.push(
                                                                `\`${
                                                                    row.identifier
                                                                }\` ⚔ Banned by ${client.users.get(
                                                                    row.actioner
                                                                )} on ${
                                                                    row.timestamp
                                                                } \n \`\`\`${
                                                                    row.description
                                                                }\`\`\`\n`
                                                            );
                                                        } else {
                                                            await events.push(
                                                                `\`${
                                                                    row.identifier
                                                                }\` 🛡 Unbanned by ${client.users.get(
                                                                    row.actioner
                                                                )} on ${
                                                                    row.timestamp
                                                                } \n \`\`\`${
                                                                    row.description
                                                                }\`\`\`\n`
                                                            );
                                                        }
                                                        if (
                                                            i == max - 1 &&
                                                            extra > 0
                                                        ) {
                                                            events.push(
                                                                `...${extra} more`
                                                            );
                                                        }
                                                    }
                                                    if (!_.isEmpty(events)) {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_info,
                                                                author: {
                                                                    name: `Warnings for ${
                                                                        cardUser.username
                                                                    }`,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: events.join(
                                                                    `\n`
                                                                ),
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_caution,
                                                                author: {
                                                                    name: cardUser.username,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: `There are no recorded warnings for this user`,
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            );
                                        } else if (r.emoji.name == '🔈') {
                                            await r.remove(r.users.last());

                                            connection.query(
                                                'select * from log_mutes where userID = ? and isDeleted = 0 order by timestamp desc',
                                                userID,
                                                async function (
                                                    err,
                                                    rows,
                                                    results
                                                ) {
                                                    if (err) throw err;
                                                    var mutes = [];
                                                    var max = 5;
                                                    var extra;

                                                    if (rows.length <= 5) {
                                                        max = rows.length;
                                                    } else {
                                                        extra =
                                                            rows.length - max;
                                                    }

                                                    for (
                                                        var i = 0; i < max; i++
                                                    ) {
                                                        var row = rows[i];
                                                        await mutes.push(
                                                            `\`${
                                                                row.identifier
                                                            }\` 🔇 Mute by ${client.users.get(
                                                                row.actioner
                                                            )} on ${
                                                                row.timestamp
                                                            } for ${
                                                                row.length
                                                            }s \n \`\`\`${
                                                                row.description
                                                            }\`\`\`\n\n`
                                                        );
                                                        if (
                                                            i == max - 1 &&
                                                            extra > 0
                                                        ) {
                                                            mutes.push(
                                                                `...${extra} more`
                                                            );
                                                        }
                                                    }
                                                    if (!_.isEmpty(mutes)) {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_info,
                                                                author: {
                                                                    name: `Mutes for ${
                                                                        cardUser.username
                                                                    }`,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: mutes.join(
                                                                    ' '
                                                                ),
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_caution,
                                                                author: {
                                                                    name: cardUser.username,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: `There are no recorded mutes for this user`,
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            );
                                        } else if (r.emoji.name == '❌') {
                                            msg.delete();
                                            message.delete();
                                        } else if (r.emoji.name == '✍') {
                                            await r.remove(r.users.last());
                                            connection.query(
                                                'select * from log_note where userID = ? and isDeleted = 0 order by timestamp desc',
                                                userID,
                                                async function (
                                                    err,
                                                    rows,
                                                    results
                                                ) {
                                                    if (err) throw err;
                                                    var notes = [];
                                                    for (
                                                        var i = 0; i < rows.length; i++
                                                    ) {
                                                        var row = rows[i];
                                                        await notes.push(
                                                            `\`${
                                                                row.identifier
                                                            }\` 📌 Note by ${client.users.get(
                                                                row.actioner
                                                            )} on ${
                                                                row.timestamp
                                                            } \n \`\`\`${
                                                                row.description
                                                            }\`\`\`\n\n`
                                                        );
                                                    }
                                                    if (!_.isEmpty(notes)) {
                                                        msg.edit({
                                                            embed: {
                                                                color: config.color_info,
                                                                author: {
                                                                    name: cardUser.username,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: notes.join(
                                                                    ' '
                                                                ),
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        msg.edit({
                                                            embed: {
                                                                color: config.color_caution,
                                                                author: {
                                                                    name: cardUser.username,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: `There are no recorded notes for this user`,
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            );
                                        } else if (r.emoji.name == '👥') {
                                            await r.remove(r.users.last());
                                            msg.edit({
                                                embed: {
                                                    color: config.color_caution,
                                                    author: {
                                                        name: cardUser.username,
                                                        icon_url: `https://cdn.discordapp.com/avatars/${
                                                            cardUser.userID
                                                        }/${
                                                            cardUser.avatar
                                                        }.jpg`
                                                    },
                                                    title: `${userID}`,
                                                    description: `This user could not be resolved. All data will be taken from the database.`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `Marvin's Little Brother | Current version: ${
                                                            config.version
                                                        }`
                                                    }
                                                }
                                            });
                                        } else if (r.emoji.name == '📥') {
                                            await r.remove(r.users.last());
                                            connection.query(
                                                `
                    select Status, timestamp
                    from(select *, 'join' as Status from log_guildjoin where userid = ?
                    union
                    select * , 'leave' as Status from log_guildleave where userid = ?
                    ) a
                    order by timestamp desc`,
                                                [userID, userID],
                                                async function (
                                                    err,
                                                    rows,
                                                    results
                                                ) {
                                                    if (err) throw err;
                                                    var history = [];
                                                    var max = 5;
                                                    var extra;

                                                    if (rows.length <= 5) {
                                                        max = rows.length;
                                                    } else {
                                                        extra =
                                                            rows.length - max;
                                                    }

                                                    for (
                                                        var i = 0; i < max; i++
                                                    ) {
                                                        var row = rows[i];
                                                        switch (row.Status) {
                                                            case 'join':
                                                                history.push(
                                                                    `📥 ${
                                                                        cardUser.username
                                                                    } joined at \`${new Date(
                                                                        row.timestamp
                                                                    )}\`\n\n`
                                                                );
                                                                break;
                                                            case 'leave':
                                                                history.push(
                                                                    `📤 ${
                                                                        cardUser.username
                                                                    } left at \`${new Date(
                                                                        row.timestamp
                                                                    )}\`\n\n`
                                                                );
                                                                break;
                                                        }
                                                        if (
                                                            i == max - 1 &&
                                                            extra > 0
                                                        ) {
                                                            history.push(
                                                                `...${extra} more`
                                                            );
                                                        }
                                                    }
                                                    if (!_.isEmpty(history)) {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_info,
                                                                author: {
                                                                    name: `Join/Leave history for ${
                                                                        cardUser.username
                                                                    }`,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: history.join(
                                                                    ' '
                                                                ),
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        await msg.edit({
                                                            embed: {
                                                                color: config.color_caution,
                                                                author: {
                                                                    name: cardUser.username,
                                                                    icon_url: `https://cdn.discordapp.com/avatars/${
                                                                        cardUser.userID
                                                                    }/${
                                                                        cardUser.avatar
                                                                    }.jpg`
                                                                },
                                                                description: `There are no join/leave records for this user`,
                                                                timestamp: new Date(),
                                                                footer: {
                                                                    text: `Marvin's Little Brother | Current version: ${
                                                                        config.version
                                                                    }`
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            return;
                                        }
                                    });
                                    //collector.on('end');
                                })
                                .catch(console.error);
                        }
                    );
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'warn') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_WARN')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    syntaxErr(message, 'warn');
                    return;
                }

                if (user == 'err') {
                    message.channel.send(
                        'An invalid user was provided. Please try again'
                    );
                } else {
                    if (guild.member(user)) {
                        var tail = args.slice(1);
                        var content = tail.join(' ').trim();

                        if (tail.length > 0) {
                            var identifier = cryptoRandomString({
                                length: 10
                            });
                            var data = [
                                user,
                                message.author.id,
                                content,
                                identifier,
                                0,
                                new Date(),
                                user /*SP arg*/
                            ];
                            connection.query(
                                'INSERT INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?); CALL user_totalRecords(?, @total) ',
                                data,
                                function (err, results) {
                                    if (err) throw err;

                                    message.channel.send({
                                        embed: {
                                            color: config.color_success,
                                            author: {
                                                name: client.user.username,
                                                icon_url: client.user.displayAvatarURL
                                            },
                                            title: '[Action] Warning added',
                                            description: `A warning was added to ${client.users.get(
                                                user
                                            )} by ${
                                                message.author
                                            }. User now has **${
                                                results[1][0].total
                                            }** records `,
                                            fields: [{
                                                    name: 'Reason',
                                                    value: content
                                                },
                                                {
                                                    name: 'Identifier',
                                                    value: identifier
                                                }
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    });

                                    client.users
                                        .get(user)
                                        .createDM()
                                        .then(async chnl => {
                                            await chnl
                                                .send({
                                                    embed: {
                                                        color: config.color_caution,
                                                        title: `You have been warned in ${
                                                            guild.name
                                                        }`,
                                                        description: `Details about the warning can be found below:`,
                                                        fields: [{
                                                                name: 'Reason',
                                                                value: content
                                                            },
                                                            {
                                                                name: 'Identifier',
                                                                value: `\`${identifier}\``
                                                            },
                                                            {
                                                                name: 'Want to dispute?',
                                                                value: 'This warning can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
                                                            }
                                                        ],
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                })
                                                .then(dm => {
                                                    var data = [
                                                        user,
                                                        dm.content,
                                                        1,
                                                        0,
                                                        identifier,
                                                        new Date(),
                                                        new Date()
                                                    ];
                                                    connection.query(
                                                        'INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',
                                                        data,
                                                        function (err, results) {
                                                            if (err) throw err;
                                                        }
                                                    );
                                                });
                                        })
                                        .catch(console.error);
                                }
                            );
                        } else {
                            message.channel.send('The warning needs a reason!');
                        }
                    } else {
                        message.channel.send(
                            'The user provided was not found in this guild'
                        );
                    }
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'cwarn') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_CWARN')) {
                if (args[0].length == 10) {
                    connection.query(
                        'UPDATE log_warn SET isDeleted = 1 WHERE identifier = ?',
                        args[0].trim(),
                        function (err, results, rows) {
                            if (err) throw err;
                            if (results.affectedRows == 1) {
                                message.channel.send(
                                    `☑ Warning with id \`${args[0].trim()}\` was successfully cleared.`
                                );
                            } else {
                                message.channel
                                    .send(
                                        `A warning with that ID could not be found`
                                    )
                                    .then(msg => {
                                        setTimeout(async () => {
                                            await msg.delete();
                                            await message.delete();
                                        }, 6000);
                                    })
                                    .catch(console.error);
                            }
                        }
                    );
                } else {
                    syntaxErr(message, 'cwarn');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'help') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            var staffHelpCommands = `
      Commands in detail can be found here: https://github.com/FMWK/logbot/wiki/Commands-in-detail

      **Fun commands:**
      ${config.prefix}flipacoin
      ${config.prefix}roll
      ${config.prefix}ask <query>

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
      ${config.prefix}helper clear <amount> <channel> <user>
      ${config.prefix}helper mute <user> <length> <reason>
      ${config.prefix}voicelog <user>
      ${config.prefix}disconnect <user>
      ${config.prefix}badwords add <word/s>
      ${config.prefix}badwords remove <word/s>
      ${config.prefix}badwords clear
      ${config.prefix}badwords list
      ${config.prefix}mute <user> <length> <reason>
      ${config.prefix}unmute <user> <reason>
      ${config.prefix}remindme <length> <reminder>
      ${config.prefix}commands add <command> <content>
      ${config.prefix}commands remove <command>
      ${config.prefix}commands list
      ${config.prefix}lock
      ${config.prefix}unlock
      `;
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
                        text: `Marvin's Little Brother | Current version: ${
                            config.version
                        }`
                    }
                }
            });
            return;
        }
        if (
            message.member.roles.some(role => ['Support'].includes(role.name))
        ) {
            var helperCommands = `
      **Fun commands:**
      **${
          config.prefix
      }flipacoin:** This command will flip a coin and return the result.
      **${
          config.prefix
      }roll:** This command will return a random number between 1 and 100.
      **${
          config.prefix
      }ask <query>:** This command will return an answer to the query.

      **Utility commands:**
      **${
          config.prefix
      }note <user> <note_content>:** This command is used to add notes to a user. When a note is added to a user, they are not notified.
      **${
          config.prefix
      }helper clear <amount> <channel> <user>:** This command is used to clear messages written by a user in the given channel.
      **${
          config.prefix
      }helper mute <user> <length> <reason>:** This command is used to mute a user for a given time period (maximum of 5 minutes).
      **${
          config.prefix
      }commands list:** This command lists all current custom commands.
      **${
          config.prefix
      }remindme <length> <reminder>:** This command is used to remind you of the note provided after the specified time has passed.

      Length formats (Case insensitive):
      \`1m\`
      \`1h\`
      \`1d\`
      \`1\` - If no suffix is given, default will be hours
      `;
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
                        text: `Marvin's Little Brother | Current version: ${
                            config.version
                        }`
                    }
                }
            });
            return;
        }

        var helpCommands = `
    ${config.prefix}bugreport
    ${config.prefix}forums
    ${config.prefix}invite
    ${config.prefix}official
    ${config.prefix}report
    ${config.prefix}roc
    ${config.prefix}support
    ${config.prefix}wiki
    `;

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
                    text: `Marvin's Little Brother | Current version: ${
                        config.version
                    }`
                }
            }
        });
    }

    if (command === 'commands') {
        if (
            message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
        ) {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
                if (args[0].toLowerCase() === 'add') {
                    if (args[1]) {
                        var commandStr = _.rest(args, 2).join(' ');
                        customCommands.set(args[1] + '.content', commandStr);
                        customCommands.set(args[1] + '.cooldown', 15);
                        customCommands.set(args[1] + '.end', '');
                        customCommands.save();
                        message.channel.send(
                            ':white_check_mark: Command added successfully.'
                        );
                    } else syntaxErr(message, `commands_add`);
                }
                if (args[0].toLowerCase() === 'remove') {
                    if (args[1]) {
                        customCommands.unset(args[1]);
                        customCommands.save();
                        message.channel.send(
                            ':white_check_mark: Command removed successfully.'
                        );
                    } else syntaxErr(message, `commands_remove`);
                }
            }
            if (args[0].toLowerCase() === 'list') {
                var cKeys = _.keys(customCommands.read());
                var allCommands = '';
                for (var i = 0; i < cKeys.length; i++) {
                    allCommands +=
                        '\n **' +
                        cKeys[i] +
                        ':** ' +
                        customCommands.get(cKeys[i]).content;
                }
                message.channel.send({
                    embed: {
                        color: config.color_info,
                        title: `**Listing all custom commands:**`,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                        },
                        description: `${allCommands}`,
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${
                                config.version
                            }`
                        }
                    }
                });
            }
        }
    }

    if (command === 'lfgrooms') {
        if (args[0].toLowerCase() === 'add') {
            let next = _.keys(LFGRoomsFile.read()).length + 1;
            LFGRoomsFile.set(args[1], next);
            LFGRoomsFile.save();

            message.channel.send(`Added \`${args[1]}\``);
        }
        if (args[0].toLowerCase() === 'remove') {
            LFGRoomsFile.unset(args[1]);
            LFGRoomsFile.save();

            message.channel.send(`Removed \`${args[1]}\``);
        }

        if (_.size(args) == 0) {
            var list = _.keys(LFGRoomsFile.read());

            message.channel.send({
                embed: {
                    color: config.color_info,
                    title: 'List of LFG rooms',
                    description: `${list.join('\n')}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${
                            config.version
                        }`
                    }
                }
            });
        }
    }

    if (command === 'lock') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
                var everyone = guild.roles.find(
                    role => role.name === '@everyone'
                );
                var channels = _.keys(LFGRoomsFile.read());
                for (var i = 0; i < channels.length; i++) {
                    var channelObj = guild.channels.find(
                        obj => obj.name == channels[i]
                    );
                    if (channelObj) {
                        if (
                            channelObj
                            .permissionsFor(everyone)
                            .has('SEND_MESSAGES')
                        ) {
                            await channelObj
                                .overwritePermissions(
                                    everyone, {
                                        SEND_MESSAGES: false
                                    },
                                    'Servers are down for the update'
                                )
                                .then(channel =>
                                    channel.send({
                                        embed: {
                                            color: config.color_info,
                                            title: 'Maintenance has begun',
                                            description: 'Channel will be locked until maintenance ends. Keep an eye on <#289467450074988545> for more info.',
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    })
                                );
                        } else
                            message.channel.send(
                                `Channel ${channels[i]} is already locked.`
                            );
                    } else
                        message.channel.send(
                            `Channel ${
                                channels[i]
                            } could not be found/resolved.`
                        );
                }
                message.channel.send(':white_check_mark: LFG channels successfully locked');
            } else
                message.channel.send(`That module (${command}) is disabled.`);
        }
    }

    if (command === 'unlock') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_LOCK/UNLOCK')) {
                var everyone = guild.roles.find(
                    role => role.name === '@everyone'
                );
                var channels = _.keys(LFGRoomsFile.read());
                for (var i = 0; i < channels.length; i++) {
                    var channelObj = guild.channels.find(
                        obj => obj.name == channels[i]
                    );
                    if (channelObj) {
                        if (
                            !channelObj
                            .permissionsFor(everyone)
                            .has('SEND_MESSAGES')
                        ) {
                            await channelObj
                                .overwritePermissions(
                                    everyone, {
                                        SEND_MESSAGES: null
                                    },
                                    'Servers are down for the update'
                                )
                                .then(channel =>
                                    channel.send({
                                        embed: {
                                            color: config.color_info,
                                            title: 'Maintenance has ended',
                                            description: 'Channel is now unlocked.',
                                            timestamp: new Date(),
                                            footer: {
                                                text: `Marvin's Little Brother | Current version: ${
                                                    config.version
                                                }`
                                            }
                                        }
                                    })
                                );
                        } else
                            message.channel.send(
                                `Channel ${channels[i]} is not locked.`
                            );
                    } else
                        message.channel.send(
                            `Channel ${
                                channels[i]
                            } could not be found/resolved.`
                        );
                }
                message.channel.send(':white_check_mark: LFG channels successfully unlocked');
            } else
                message.channel.send(`That module (${command}) is disabled.`);
        }
    }

    if (command === 'helper') {
        if (args[0].toLowerCase() === 'clear') {
            if (
                message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
            ) {
                if (modulesFile.get('COMMAND_HELPER_CLEAR')) {
                    if (args.length >= 4) {
                        var amount = args[1];
                        var channelid = parseChannelTag(args[2]);
                        var userid = parseUserTag(args[3]);

                        var channel = guild.channels.get(channelid);
                        var user = client.users.get(userid);
                        var deleted = 0;

                        if (user && guild.member(user)) {
                            channel
                                .fetchMessages({
                                    limit: 100
                                })
                                .then(async a => {
                                    await channel
                                        .bulkDelete(
                                            a
                                            .filter(
                                                b => b.author.id == user.id
                                            )
                                            .first(parseInt(amount))
                                        )
                                        .then(result => (deleted = result.size))
                                        .catch(console.error);

                                    if (deleted > 0) {
                                        var identifier = cryptoRandomString({
                                            length: 10
                                        });
                                        guild.channels
                                            .find(
                                                chnl => chnl.name === 'helpers'
                                            )
                                            .send({
                                                embed: {
                                                    color: config.color_success,
                                                    title: `[Action] Messages cleared`,
                                                    description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}\n\nThis action was carried out by ${
                                                        message.author
                                                    }\n`,
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: `${identifier} | Marvin's Little Brother | Current version: ${
                                                            config.version
                                                        }`
                                                    }
                                                }
                                            });
                                        var data = [
                                            user.id,
                                            message.author.id,
                                            channel.id,
                                            deleted,
                                            identifier,
                                            new Date()
                                        ];
                                        connection.query(
                                            'INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)',
                                            data,
                                            function (err, results) {
                                                if (err) throw err;
                                            }
                                        );
                                    } else {
                                        message.channel
                                            .send(
                                                'The command executed successfully but no messages were removed. Ensure the correct channel was used.'
                                            )
                                            .then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 5000);
                                            })
                                            .catch(console.error);
                                    }
                                })
                                .catch(console.error);
                        } else {
                            message.channel.send(
                                'The user provided was not found in this guild'
                            );
                        }
                    } else {
                        syntaxErr(message, 'helper_clear');
                    }
                } else {
                    message.channel.send(
                        `That module (${command}) is disabled.`
                    );
                }
            }
        }
      
        if (args[0].toLowerCase() === 'mute') {
            //mute userid 5 why
            if (
                message.member.roles.some(role => ['Support'].includes(role.name))
            ) {
                if (modulesFile.get('COMMAND_HELPER_MUTE')) {
                    var user = parseUserTag(args[1]);
                    var guildUser = guild.member(user);

                    if (user !== 'err' && guildUser) {
                        if (mutedFile.get(user)) {
                            var existingMute = mutedFile.get(user);
                            message.channel.send(
                                `${client.users.get(
                                    user
                                )} already has an active mute. This will end at ${new Date(
                                    existingMute.end * 1000
                                )}`
                            );
                        } else {
                            if (parseInt(args[2])) {
                                if (args[2] <= 5) {
                                    var end =
                                        Math.floor(Date.now() / 1000) +
                                        args[2] * 60;
                                    var seconds = args[2] * 60;

                                    var reason = _.rest(args, 3).join(' ');

                                    if (reason.length > 0) {
                                        mutedFile.set(`${user}.end`, end);
                                        mutedFile.set(
                                            `${user}.actioner`,
                                            message.author.id
                                        );
                                        mutedFile.set(`${user}.actionee`, user);
                                        mutedFile.set(`${user}.reason`, reason);
                                        mutedFile.set(`${user}.isHelper`, 1);
                                        mutedFile.save();

                                        var mutedRole = guild.roles.find(
                                            val => val.name === 'Muted'
                                        );
                                        var identifier = cryptoRandomString({
                                            length: 10
                                        });

                                        guild
                                            .member(user)
                                            .addRole(mutedRole)
                                            .then(member => {
                                                if (member.voiceChannel !== undefined) {
                                                    member.setVoiceChannel(null)
                                                        .catch(console.error);
                                                }

                                                message.channel.send({
                                                    embed: {
                                                        color: config.color_success,
                                                        author: {
                                                            name: client.user
                                                                .username,
                                                            icon_url: client.user
                                                                .displayAvatarURL
                                                        },
                                                        title: '[Action] User Muted',
                                                        description: `${member} was muted by ${
                                                            message.author
                                                        } for ${args[2]}m`,
                                                        fields: [{
                                                                name: 'Reason',
                                                                value: reason
                                                            },
                                                            {
                                                                name: 'Identifier',
                                                                value: identifier,
                                                                inline: true
                                                            },
                                                            {
                                                                name: 'Note',
                                                                value: `I also attempted to disconnect the user from their voice channel`,
                                                                inline: true
                                                            }
                                                        ],
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                                var data = [
                                                    user,
                                                    message.author.id,
                                                    reason,
                                                    seconds,
                                                    identifier,
                                                    0,
                                                    new Date()
                                                ];
                                                connection.query(
                                                    'INSERT INTO log_mutes(userID, actioner, description, length, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?,?)',
                                                    data,
                                                    function (err, results) {
                                                        if (err) throw err;
                                                    }
                                                );

                                                member
                                                    .createDM()
                                                    .then(async chnl => {
                                                        await chnl
                                                            .send({
                                                                embed: {
                                                                    color: config.color_caution,
                                                                    title: `You have been muted in ${
                                                                        guild.name
                                                                    }`,
                                                                    description: `Details regarding the mute can be found below:`,
                                                                    fields: [{
                                                                            name: 'Reason',
                                                                            value: reason,
                                                                            inline: true
                                                                        },
                                                                        {
                                                                            name: 'Length',
                                                                            value: `${
                                                                                args[2]
                                                                            }m`,
                                                                            inline: true
                                                                        },
                                                                        {
                                                                            name: 'Identifier',
                                                                            value: `\`${identifier}\``
                                                                        },
                                                                        {
                                                                            name: 'Want to dispute?',
                                                                            value: 'This mute can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
                                                                        }
                                                                    ],
                                                                    timestamp: new Date(),
                                                                    footer: {
                                                                        text: `Marvin's Little Brother | Current version: ${
                                                                            config.version
                                                                        }`
                                                                    }
                                                                }
                                                            })
                                                            .then(dm => {
                                                                if (
                                                                    dm.embeds[0]
                                                                    .type ===
                                                                    'rich'
                                                                ) {
                                                                    var data = [
                                                                        user,
                                                                        dm
                                                                        .embeds[0]
                                                                        .title,
                                                                        3,
                                                                        0,
                                                                        identifier,
                                                                        new Date(),
                                                                        new Date()
                                                                    ];
                                                                } else {
                                                                    var data = [
                                                                        user,
                                                                        dm.content,
                                                                        3,
                                                                        0,
                                                                        identifier,
                                                                        new Date(),
                                                                        new Date()
                                                                    ];
                                                                }
                                                                connection.query(
                                                                    'INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',
                                                                    data,
                                                                    function (
                                                                        err,
                                                                        results
                                                                    ) {
                                                                        if (err)
                                                                            throw err;
                                                                    }
                                                                );
                                                            });
                                                    })
                                                    .catch(console.error);
                                            })
                                            .catch(console.error);
                                    } else {
                                        message.channel.send(
                                            'Please provide a reason for the mute.'
                                        );
                                    }
                                } else {
                                    message.channel.send(
                                        'That mute length is too long.'
                                    );
                                }
                            } else {
                                message.channel.send(
                                    `Hm, that length doesn't seem right? ${
                                        args[2]
                                    }`
                                );
                                return;
                            }
                        }
                    } else {
                        message.channel.send(
                            'The user provided was not found.'
                        );
                    }
                } else {
                    message.channel.send(
                        `That module (${command}) is disabled.`
                    );
                }
            }
        }
    }

    if (command === 'voicelog') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_VOICELOG')) {
                if (args[0]) {
                    var user = parseUserTag(args[0]);
                } else {
                    syntaxErr(message, 'voicelog');
                    return;
                }

                if (user == 'err') {
                    message.channel.send(
                        'An invalid user was provided. Please try again'
                    );
                } else {
                    connection.query(
                        'select * from log_voice where userID = ? ORDER BY timestamp DESC LIMIT 22',
                        user,
                        async function (err, rows, results) {
                            if (err) throw err;

                            var times = [];
                            var current = [];
                            var timestamps = [];
                            var msg = [
                                'Channel        |                     Timestamp                     | Duration (H:M:S)',
                                '------------------------------------------------------------------------------------------------'
                            ];
                            for (var i = rows.length - 1; i >= 0; i--) {
                                var row = rows[i];

                                if (rows[i - 1]) {
                                    //We have a next event
                                    var next = rows[i - 1];

                                    if (
                                        row.type !== 3 && [2, 3].indexOf(next.type) > -1
                                    ) {
                                        //The current event IS NOT a leave event AND the next event IS a move or leave event. i.e, that's a complete wrap of one channel.
                                        var time1 = row.timestamp;
                                        var time2 = next.timestamp;

                                        var diff =
                                            time2.getTime() - time1.getTime();

                                        var msec = diff;
                                        var hh = Math.floor(
                                            msec / 1000 / 60 / 60
                                        );
                                        msec -= hh * 1000 * 60 * 60;
                                        var mm = Math.floor(msec / 1000 / 60);
                                        msec -= mm * 1000 * 60;
                                        var ss = Math.floor(msec / 1000);
                                        msec -= ss * 1000;

                                        times.push(`${hh}:${mm}:${ss}`);
                                        current.push(row.newChannel);
                                        timestamps.push(
                                            `${row.timestamp.toUTCString()} (${moment(
                                                row.timestamp.toUTCString()
                                            ).fromNow()})`
                                        );
                                    }
                                } else if (
                                    !rows[i - 1] && [1, 2].indexOf(row.type) > -1
                                ) {
                                    //No next event available AND current event is a fresh join or move. i.e, we can assume they are still here.
                                    current.push(row.newChannel);
                                    times.push('Active');
                                    timestamps.push(
                                        `${row.timestamp.toUTCString()} (${moment(
                                            row.timestamp.toUTCString()
                                        ).fromNow()})`
                                    );
                                } else {}
                            }
                            times.reverse();
                            current.reverse();
                            timestamps.reverse();

                            var longest = 0;
                            for (var i = 0; i < current.length; i++) {
                                if (current[i].length > longest) {
                                    longest = current[i].length;
                                }
                            }
                            for (var j = 0; j < current.length; j++) {
                                var howManyToAdd = longest - current[j].length;
                                current[j] = current[j].padEnd(
                                    current[j].length + howManyToAdd + 1
                                );
                            }

                            var longestTime = 0;
                            for (var i = 0; i < timestamps.length; i++) {
                                if (current[i].length > longestTime) {
                                    longestTime = timestamps[i].length;
                                }
                            }
                            for (var j = 0; j < timestamps.length; j++) {
                                var howManyToAdd =
                                    longestTime - timestamps[j].length;
                                timestamps[j] = timestamps[j].padEnd(
                                    timestamps[j].length + howManyToAdd + 1
                                );
                            }

                            for (var i = 0; i < times.length; i++) {
                                msg.push(
                                    `${current[i]}|     ${
                                        timestamps[i]
                                    }     | ${times[i]}`
                                );
                            }
                            var joinedMessage = msg.join('\n');
                            message.channel.send(
                                `🎙 Viewing the voice logs of ${client.users.get(
                                    user
                                )} \`\`\`${joinedMessage}\`\`\``
                            );
                        }
                    );
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'disconnect') {
        if (
            message.member.roles.some(role => ['Admins', 'Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_DISCONNECT')) {
                var user = parseUserTag(args[0]);
                var guildUser = guild.member(user);

                if (
                    user !== 'err' &&
                    guildUser &&
                    guildUser.voiceChannel !== undefined
                ) {
                    guildUser
                        .setVoiceChannel(null)
                        .then(member => {
                            message.channel.send(
                                `${member} was successfully removed from their voice channel.`
                            );
                        })
                        .catch(console.error);
                } else {
                    message.channel.send(
                        'The user provided was not found or is not in a voice channel.'
                    );
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'badwords') {
        if (args[0].toLowerCase() === 'add') {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
                if (args[1]) {
                    var newWords = args.splice(1);
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < newWords.length; j++) {
                            if (i != j && newWords[i] == newWords[j]) {
                                message.channel.send(
                                    `:x: The argument contains duplicates.`
                                );
                                return;
                            }
                        }
                    }
                    var currentWords = badWordsFile.get(`badWords`);
                    if (currentWords.length > 0) {
                        if (
                            currentWords.some(word => newWords.includes(word))
                        ) {
                            message.channel.send(
                                `:x: One or more words are already on the list.`
                            );
                            return;
                        }
                    }
                    currentWords = currentWords.concat(newWords);
                    badWordsFile.set(`badWords`, currentWords);
                    badWordsFile.save();
                    message.channel.send(
                        `:white_check_mark: Word(s) \`${newWords}\` added successfully.`
                    );
                } else {
                    message.channel
                        .send(`Please specify a word or words to add.`)
                        .then(msg => {
                            setTimeout(async () => {
                                await message.delete();
                                await msg.delete();
                            }, 7000);
                        })
                        .catch(console.error);
                }
            }
        }
        if (args[0].toLowerCase() === 'remove') {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
                if (args[1]) {
                    var newWords = args.splice(1);
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < newWords.length; j++) {
                            if (i != j && newWords[i] == newWords[j]) {
                                message.channel.send(
                                    `:x: The argument contains duplicates.`
                                );
                                return;
                            }
                        }
                    }
                    var currentWords = badWordsFile.get(`badWords`);
                    var numberOfElements = 0;
                    for (var i = 0; i < newWords.length; i++) {
                        for (var j = 0; j < currentWords.length; j++) {
                            if (newWords[i] === currentWords[j])
                                numberOfElements++;
                        }
                    }
                    if (numberOfElements < newWords.length) {
                        message.channel.send(
                            `:x: One or more words are not on the list.`
                        );
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
                    message.channel.send(
                        `:white_check_mark: All words \`${newWords}\` removed successfully.`
                    );
                } else {
                    message.channel
                        .send(`Please specify a word or words to remove.`)
                        .then(msg => {
                            setTimeout(async () => {
                                await message.delete();
                                await msg.delete();
                            }, 7000);
                        })
                        .catch(console.error);
                }
            }
        }
        if (args[0].toLowerCase() === 'clear') {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
                if (badWordsFile.get(`badWords`).length > 0) {
                    badWordsFile.unset(`badWords`);
                    badWordsFile.set(`badWords`, []);
                    badWordsFile.save();
                    message.channel.send(
                        `:white_check_mark: All bad words successfully removed.`
                    );
                } else message.channel.send(`:x: No bad words could be found.`);
            }
        }
        if (args[0].toLowerCase() === 'list') {
            if (
                message.member.roles.some(role => ['Moderators'].includes(role.name))
            ) {
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
                                text: `Marvin's Little Brother | Current version: ${
                                    config.version
                                }`
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
                                text: `Marvin's Little Brother | Current version: ${
                                    config.version
                                }`
                            }
                        }
                    });
                }
            }
        }
    }

    if (command === 'mute') {
        if (
            message.member.roles.some(role => ['Moderators'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_MUTE')) {
                var user = parseUserTag(args[0]);
                var guildUser = guild.member(user);

                if (user !== 'err' && guildUser) {
                    if (mutedFile.get(user)) {
                        var existingMute = mutedFile.get(user);
                        message.channel.send(
                            `${client.users.get(
                                user
                            )} already has an active mute. This will end at ${new Date(
                                existingMute.end * 1000
                            )}`
                        );
                    } else {
                        var end;
                        var seconds;
                        var int = args[1].replace(/[a-zA-Z]$/g, '');

                        if (parseInt(int)) {
                            switch (
                                args[1].toLowerCase().charAt(args[1].length - 1)
                            ) {
                                case 'd':
                                    end =
                                        Math.floor(Date.now() / 1000) +
                                        int * 24 * 60 * 60;
                                    seconds = int * 24 * 60 * 60;
                                    break;
                                case 'h':
                                    end =
                                        Math.floor(Date.now() / 1000) +
                                        int * 60 * 60;
                                    seconds = int * 60 * 60;
                                    break;
                                case 'm':
                                    end =
                                        Math.floor(Date.now() / 1000) +
                                        int * 60;
                                    seconds = int * 60;
                                    break;
                                default:
                                    end =
                                        Math.floor(Date.now() / 1000) +
                                        int * 60 * 60;
                                    seconds = int * 60 * 60;
                                    break;
                            }

                            var reason = _.rest(args, 2).join(' ');

                            if (reason.length > 0) {
                                mutedFile.set(`${user}.end`, end);
                                mutedFile.set(
                                    `${user}.actioner`,
                                    message.author.id
                                );
                                mutedFile.set(`${user}.actionee`, user);
                                mutedFile.set(`${user}.reason`, reason);
                                mutedFile.set(`${user}.isHelper`, 0);
                                mutedFile.save();

                                var mutedRole = guild.roles.find(
                                    val => val.name === 'Muted'
                                );
                                var identifier = cryptoRandomString({
                                    length: 10
                                });

                                guild
                                    .member(user)
                                    .addRole(mutedRole)
                                    .then(member => {
                                        if (member.voiceChannel !== undefined) {
                                            member.setVoiceChannel(null)
                                        }

                                        var data = [
                                            user,
                                            message.author.id,
                                            reason,
                                            seconds,
                                            identifier,
                                            0,
                                            new Date(),
                                            user /*SP arg*/
                                        ];
                                        connection.query(
                                            'INSERT INTO log_mutes(userID, actioner, description, length, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?,?); CALL user_totalRecords(?, @total)',
                                            data,
                                            function (err, results) {
                                                if (err) throw err;

                                                message.channel.send({
                                                    embed: {
                                                        color: config.color_success,
                                                        author: {
                                                            name: client.user
                                                                .username,
                                                            icon_url: client.user
                                                                .displayAvatarURL
                                                        },
                                                        title: '[Action] User Muted',
                                                        description: `${member} was muted by ${
                                                            message.author
                                                        } for ${
                                                            args[1]
                                                        }. User now has **${
                                                            results[1][0].total
                                                        }** records`,
                                                        fields: [{
                                                                name: 'Reason',
                                                                value: reason
                                                            },
                                                            {
                                                                name: 'Identifier',
                                                                value: identifier,
                                                                inline: true
                                                            },
                                                            {
                                                                name: 'Note',
                                                                value: `I also attempted to disconnect the user from their voice channel`,
                                                                inline: true
                                                            }
                                                        ],
                                                        timestamp: new Date(),
                                                        footer: {
                                                            text: `Marvin's Little Brother | Current version: ${
                                                                config.version
                                                            }`
                                                        }
                                                    }
                                                });
                                            }
                                        );

                                        member
                                            .createDM()
                                            .then(async chnl => {
                                                await chnl
                                                    .send({
                                                        embed: {
                                                            color: config.color_caution,
                                                            title: `You have been muted in ${
                                                                guild.name
                                                            }`,
                                                            description: `Details regarding the mute can be found below:`,
                                                            fields: [{
                                                                    name: 'Reason',
                                                                    value: reason,
                                                                    inline: true
                                                                },
                                                                {
                                                                    name: 'Length',
                                                                    value: args[1],
                                                                    inline: true
                                                                },
                                                                {
                                                                    name: 'Identifier',
                                                                    value: `\`${identifier}\``
                                                                },
                                                                {
                                                                    name: 'Want to dispute?',
                                                                    value: 'This mute can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you.'
                                                                }
                                                            ],
                                                            timestamp: new Date(),
                                                            footer: {
                                                                text: `Marvin's Little Brother | Current version: ${
                                                                    config.version
                                                                }`
                                                            }
                                                        }
                                                    })
                                                    .then(dm => {
                                                        if (
                                                            dm.embeds[0]
                                                            .type === 'rich'
                                                        ) {
                                                            var data = [
                                                                user,
                                                                dm.embeds[0]
                                                                .title,
                                                                3,
                                                                0,
                                                                identifier,
                                                                new Date(),
                                                                new Date()
                                                            ];
                                                        } else {
                                                            var data = [
                                                                user,
                                                                dm.content,
                                                                3,
                                                                0,
                                                                identifier,
                                                                new Date(),
                                                                new Date()
                                                            ];
                                                        }
                                                        connection.query(
                                                            'INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',
                                                            data,
                                                            function (
                                                                err,
                                                                results
                                                            ) {
                                                                if (err)
                                                                    throw err;
                                                            }
                                                        );
                                                    });
                                            })
                                            .catch(console.error);
                                    })
                                    .catch(console.error);
                            } else {
                                message.channel.send(
                                    'Please provide a reason for the mute.'
                                );
                            }
                        } else {
                            message.channel.send(
                                `Hm, that length doesn't seem right? ${int}`
                            );
                            return;
                        }
                    }
                } else {
                    message.channel.send('The user provided was not found.');
                }
            } else {
                message.channel.send(`That module (${command}) is disabled.`);
            }
        }
    }

    if (command === 'unmute') {
      if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
        if (modulesFile.get('COMMAND_UNMUTE')) {
          var user = parseUserTag(args[0]);
          var guildUser = guild.member(user);

          if (user !== 'err' && guildUser) {
            if ((mutedFile.get(user)) || (guild.members.get(user).roles.some(r => r.name === 'Muted'))) {
              var reason = _.rest(args, 1).join(' ');

              if (reason.length > 0) {
                            
                mutedFile.unset(`${user}`);
                mutedFile.save();

                var mutedRole = guild.roles.find(val => val.name === 'Muted');
                var identifier = cryptoRandomString({ length: 10 });

                guild.member(user).removeRole(mutedRole).then(member => {
                  var data = [user, message.author.id, reason, identifier, 0, new Date(), user /*SP arg*/];
                  connection.query('INSERT INTO log_unmutes(userID, actioner, description, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?);',
                  data, function (err, results) {
                    if (err) throw err;
                    message.channel.send({embed: {
                        color: config.color_success,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.displayAvatarURL
                        },
                        title: '[Action] User Unmuted',
                        description: `${member} was unmuted by ${message.author}.`,
                        fields: [
                            {
                            name: 'Reason',
                            value: reason
                            },
                            {
                          name: 'Identifier',
                          value: identifier,
                          inline: true
                          }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Marvin's Little Brother | Current version: ${config.version}`
                        }
                      }
                    });
                  });
                member.createDM().then(async chnl => {
                  await chnl.send({
                    embed: {
                      color: config.color_info,
                      title: `You have been unmuted in ${guild.name}`,
                      description: `Details regarding the mute can be found below:`,
                      fields: [
                          {
                          name: 'Reason',
                          value: reason,
                          inline: true
                          },
                          {
                          name: 'Identifier',
                          value: `\`${identifier}\``
                          }
                      ],
                      timestamp: new Date(),
                      footer: {
                        text: `Marvin's Little Brother | Current version: ${config.version}`
                      }
                    }
                  }).then(dm => {
                    if (dm.embeds[0].type === 'rich') {
                      var data = [user, dm.embeds[0].title, 3, 0, identifier, new Date(), new Date()];
                    } else {
                      var data = [user, dm.content, 3, 0, identifier, new Date(), new Date()];
                    }
                    connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)',data, function (err, results) {
                      if (err) throw err;
                    });
                  });
                }).catch(console.error);
              }).catch(console.error);
            } else {
                message.channel.send('Please provide a reason for the unmute.');
            }
          } else {
            message.channel.send(`${client.users.get(user)} does not have an active mute.`);
          }
        } else {
            message.channel.send('The user provided was not found.');
        }
      } else {
          message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

    if (command === 'remindme') {
        if (
            message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
        ) {
            if (modulesFile.get('COMMAND_REMINDME')) {
                var user = message.author.id;
                var end;
                var int = args[0].replace(/[a-zA-Z]$/g, '');
                if (parseInt(int)) {
                    switch (args[0].toLowerCase().charAt(args[0].length - 1)) {
                        case 'd':
                            end =
                                Math.floor(Date.now() / 1000) +
                                int * 24 * 60 * 60;
                            seconds = int * 24 * 60 * 60;
                            break;
                        case 'h':
                            end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                            seconds = int * 60 * 60;
                            break;
                        case 'm':
                            end = Math.floor(Date.now() / 1000) + int * 60;
                            seconds = int * 60;
                            break;
                        default:
                            end = Math.floor(Date.now() / 1000) + int * 60 * 60;
                            seconds = int * 60 * 60;
                            break;
                    }

                    var reminder = _.rest(args, 1).join(' ');

                    if (reminder.length > 0) {
                        reminderFile.set(
                            `${user}${end}.who`,
                            message.author.id
                        );
                        reminderFile.set(`${user}${end}.end`, end);
                        reminderFile.set(`${user}${end}.reminder`, reminder);
                        reminderFile.set(`${user}${end}.length`, args[0]);
                        reminderFile.save();

                        message.channel.send({
                            embed: {
                                color: config.color_success,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.displayAvatarURL
                                },
                                title: `Reminder Set`,
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${
                                        config.version
                                    }`
                                }
                            }
                        });
                    } else {
                        message.channel.send('Please provide a reminder note.');
                    }
                }
            }
        }
    }

    if (command === 'status') {
        if (
            message.member.roles.some(role => ['Moderators', 'Support'].includes(role.name))
        ) {
            var client_PING = Math.floor(client.ping);
            var db_PING = connection.ping();

            var client_STATUS;
            var db_STATUS;

            if (client_PING >= 1 && client_PING <= 500) {
                client_STATUS = 'OK';
            } else if (client_PING > 500 && client_PING <= 5000) {
                client_STATUS = 'Degraded';
            } else {
                client_STATUS = 'Severely Degraded or Error';
            }

            if (db_PING) {
                db_STATUS = 'OK';
            } else {
                db_STATUS = 'Severely Degraded or Error';
            }

            message.channel.send({
                embed: {
                    color: config.color_info,
                    description: `**Client -** ${client_STATUS} (${client_PING}ms)\n **Database -** ${db_STATUS}`,
                    timestamp: new Date(),
                    footer: {
                        text: `Marvin's Little Brother | Current version: ${
                            config.version
                        }`
                    }
                }
            });
        }
    }
});
//discord events
client.on('messageUpdate', function (oldMessage, newMessage) {
    if (modulesFile.get('EVENT_MESSAGE_UPDATE')) {
        if (newMessage.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [
            newMessage.author.id,
            newMessage.id,
            newMessage.content,
            oldMessage.content,
            newMessage.channel.id,
            2,
            new Date()
        ];
        connection.query(
            'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)',
            data,
            function (err, results) {
                if (err) throw err;
            }
        );
    }
});

client.on('messageDelete', function (message) {
    if (modulesFile.get('EVENT_MESSAGE_DELETE')) {
        if (message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
        var data = [
            message.author.id,
            message.id,
            '',
            message.content,
            message.channel.id,
            3,
            new Date()
        ];
        connection.query(
            'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)',
            data,
            function (err, results) {
                if (err) throw err;
            }
        );
    }
});

client.on('guildMemberAdd', function (member) {
    if (modulesFile.get('EVENT_GUILD_MEMBER_ADD')) {
        var params = [
            member.user.id,
            member.user.username,
            member.user.avatar,
            1,
            new Date(),
            member.user.id,
            member.user.id,
            new Date()
        ];
        connection.query(
            `
      INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES (?,?,?,?,?);
      UPDATE users SET exist = 1 WHERE userID = ?;
      INSERT INTO log_guildjoin (userID, timestamp) VALUES (?,?);
      `,
            params,
            function (err, results) {
                if (err) throw err;
            }
        );
    }

    if (modulesFile.get('EVENT_BANNDUSER_DETEC')) {
        var guild = client.guilds.get(config.guildid);
        var banndUsers = bannedUsersFile.get();
        var usernames = _.values(banndUsers);
        var ids = _.keys(banndUsers);
        var hits = [];
        var identifiers = [];
        var data = [];
        var message = [];

        var match = stringSimilarity.findBestMatch(
            member.user.username,
            usernames
        );

        for (var a = 0; a < match['ratings'].length; a++) {
            if (match['ratings'][a].rating >= 0.5) {
                hits.push({
                    username: match['ratings'][a].target, //Username of the ban
                    rating: match['ratings'][a].rating, //decimal of the similarity
                    identifier: ids[a] //<identifier> of the ban
                });
                identifiers.push(ids[a]);
            }
        }

        if (identifiers.length > 0) {
            data.push(identifiers); //If this work - ew.....you motherfucker, it did.

            connection.query(
                'select * from log_guildbans where identifier in (?)',
                data,
                function (err, rows, results) {
                    if (err) throw err;
                    for (var b = 0; b < rows.length; b++) {
                        var row = rows[b];
                        message.push(
                            `\`(${hits[b].rating
                                .toString()
                                .substring(0, 5)})\` \`${
                                hits[b].identifier
                            }\` \`${hits[b].username}\` was banned for: ${
                                row.description
                            } \n\n`
                        );
                    }

                    guild.channels
                        .find(val => val.name === 'server-log')
                        .send({
                            embed: {
                                color: config.color_warning,
                                title: `❗ ${member.user.username}#${
                                    member.user.discriminator
                                } matches one or more previous ban record(s)`,
                                description: message.join(''),
                                timestamp: new Date(),
                                footer: {
                                    text: `Marvin's Little Brother | Current version: ${
                                        config.version
                                    }`
                                }
                            }
                        });
                }
            );
        }
    }
});

client.on('guildMemberRemove', function (member) {
    if (modulesFile.get('EVENT_GUILD_MEMBER_LEAVE')) {
        var data = [member.user.id, new Date()];
        var userLeave = [0, member.user.id];

        connection.query(
            'INSERT INTO log_guildleave (userID, timestamp) VALUES (?,?)',
            data,
            function (err, results) {
                if (err) throw err;
            }
        );
        connection.query(
            'UPDATE users SET exist = ? WHERE userID = ?',
            userLeave,
            function (err, results) {
                if (err) throw err;
            }
        );
    }
});

client.on('voiceStateUpdate', function (oldMember, newMember) {
    if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES')) {
        var data = [];
        if (oldMember.voiceChannel) {
            if (newMember.voiceChannel) {
                if (oldMember.voiceChannel.id !== newMember.voiceChannel.id) {
                    data = [
                        newMember.id,
                        newMember.voiceChannel.id,
                        newMember.voiceChannel.name,
                        oldMember.voiceChannel.id,
                        oldMember.voiceChannel.name,
                        2,
                        new Date()
                    ];
                } else {
                    return;
                }
            } else {
                data = [
                    newMember.id,
                    '',
                    '',
                    oldMember.voiceChannel.id,
                    oldMember.voiceChannel.name,
                    3,
                    new Date()
                ];
            }
        } else {
            if (newMember.voiceChannel) {
                data = [
                    newMember.id,
                    newMember.voiceChannel.id,
                    newMember.voiceChannel.name,
                    '',
                    '',
                    1,
                    new Date()
                ];
            } else {
                data = [
                    newMember.id,
                    'UNKNOWN',
                    'UNKNOWN',
                    '',
                    '',
                    1,
                    new Date()
                ];
            }
        }
        if (data.length > 0) {
            connection.query(
                'INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)',
                data,
                function (err, results) {
                    if (err) throw err;

                    if (modulesFile.get('EVENT_GUILD_VOICE_UPDATES_LOG')) {
                        var voiceLogChannel = newMember.guild.channels.get(config.channel_voicelog);
                        if (voiceLogChannel.members.has(newMember.id)) {
                            switch (data[5]) { //Switch on the type
                                case 1: //join
                                    voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>** | ${data[6]}`);
                                    break;
                                case 2: //move
                                    voiceLogChannel.send(`${newMember.user.username}#${newMember.user.discriminator} has joined **<#${data[1]}>**, moving from **<#${data[3]}>** | ${data[6]}`);
                                    break;
                            }
                        }
                        else {
                            switch (
                                data[5] //Switch on the type
                            ) {
                                case 1: //join
                                        voiceLogChannel.send(
                                            `<@${data[0]}> has joined **<#${
                                                data[1]
                                            }>** | ${data[6]}`
                                        );
                                    break;
                                case 2: //move
                                    voiceLogChannel.send(
                                            `<@${data[0]}> has joined **<#${
                                                data[1]
                                            }>**, moving from **<#${data[3]}>** | ${
                                                data[6]
                                            }`
                                        );
                                    break;
                            }
                        }
                    }
                }
            );
        }
    }
});

client.on('userUpdate', function (oldUser, newUser) {
    if (modulesFile.get('EVENT_USER_UPDATE')) {
        //Checking for username changes for logging
        if (oldUser.username !== newUser.username) {
            var data = [
                newUser.id,
                newUser.username,
                oldUser.username,
                new Date()
            ];
            connection.query(
                'INSERT INTO log_username (userID, new, old, timestamp) VALUES (?,?,?,?)',
                data,
                function (err, results) {
                    if (err) throw err;
                }
            );
        }

        //Checking for avatar changes to update user table
        if (oldUser.avatar !== newUser.avatar) {
            var data = [newUser.avatar, new Date(), newUser.id];
            connection.query(
                'UPDATE users SET avatar = ?, updated = ? WHERE userID = ?',
                data,
                function (err, results) {
                    if (err) throw err;
                }
            );
        }
    }
});

client.on('guildMemberUpdate', function (oldMember, newMember) {
    if (modulesFile.get('EVENT_GUILD_MEMBER_UPDATE')) {
        //Checking for nickname changes for logging
        if (oldMember.displayName !== newMember.displayName) {
            var data = [
                newMember.user.id,
                newMember.displayName,
                oldMember.displayName,
                new Date()
            ];
            connection.query(
                'INSERT INTO log_nickname (userID, new, old, timestamp) VALUES (?,?,?,?)',
                data,
                function (err, results) {
                    if (err) throw err;
                }
            );
        }
    }
});

client.on('guildBanAdd', function(guild, user) {
    var identifier = cryptoRandomString({ length: 10 });
    bannedUsersFile.set(identifier, user.username);
    bannedUsersFile.save();

    var data = [user.id, '001', 'SYSTEM BAN', identifier, 0, new Date()];
    connection.query(
        'INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)',
        data,
        function (err, results) {
            if (err) throw err;
        }
    );
});

client.on('guildBanRemove', function(guild, user) {
  var identifier = cryptoRandomString({length: 10});
  var data = [user.id, '001', "SYSTEM BAN", identifier, 0, new Date()];
  connection.query(
    'INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
    function(err, results){
      if(err) throw err;
    }
  );
  connection.query('select identifier from log_guildbans where userid = ? order by timestamp desc limit 1', user.id, function(err, rows, results){
    if(err) throw err;

    bannedUsersFile.set(rows[0].identifier, '');
    bannedUsersFile.save();
  });
});

client.on('error', console.error);

client.on('warn', warn => {
    console.log(warn);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

client.login(config.token);