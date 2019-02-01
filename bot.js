/*
##################################################
##           Command Process Guideline          ##
##                                              ##
##            Check author permissions          ##
##        Check arg(s) positions/existence      ##
##         Check parsed user tag validity       ##
##          Check guild member existence        ##
##             ?Check following args            ##
##################################################
*/

const Discord             = require("discord.js");
const client              = new Discord.Client();
const Store               = require('data-store');
const mysql               = require('mysql2');
var moment                = require('moment');
var _                     = require('underscore');
var fs                    = require("fs");
const cryptoRandomString  = require('crypto-random-string');
var stringSimilarity      = require('string-similarity');
const editJsonFile        = require("edit-json-file");
const changelog           = require("./changelog.json");
const modulesFilePath     = './modules.json';
var modules               = require("./modules.json");
const config              = require("./config.json");
var modulesFile           = editJsonFile(modulesFilePath);

var bannedUsers           = require("./banned_users.json");
var bannedUsersFile       = editJsonFile("./banned_users.json");
var bannedUsersArray      = [];



//Put your MySQL info here
const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  multipleStatements: config.multipleStatements,
});

connection.connect(function(err, results){
  if (err) throw err;
});

function setupTables(){
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
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_nickname
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          username VARCHAR(255)     NOT NULL,
          newNickname VARCHAR(255),
          oldNickname VARCHAR(255),
          timestamp DATETIME       NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_username
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          newUsername VARCHAR(255)  NOT NULL,
          oldUsername VARCHAR(255),
          timestamp DATETIME       NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_guildjoin
        (
          userID VARCHAR(25)       NOT NULL,
          joinedAs VARCHAR(255)    NOT NULL,
          timestamp DATETIME,
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
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
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_guildbans
        (
          userID VARCHAR(25)       NOT NULL,
          username VARCHAR(255)     NOT NULL,
          discriminator VARCHAR(4),
          bannedBy VARCHAR(255),
          reason text,
          note text,
          identifier VARCHAR(10),
          timestamp DATETIME,
          PRIMARY KEY (userID, timestamp)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_guildunbans
        (
          userID VARCHAR(25)       NOT NULL,
          username VARCHAR(255)     NOT NULL,
          discriminator VARCHAR(4),
          unbannedBy VARCHAR(255),
          reason text,
          note text,
          identifier VARCHAR(10),
          timestamp DATETIME,
          PRIMARY KEY (userID, timestamp)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_note
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          addedBy VARCHAR(25)       NOT NULL,
          note text,
          identifier VARCHAR(10),
          isDeleted bit,
          timestamp DATETIME        NOT NULL,
          updated timestamp         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (addedBy) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_warn
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          addedBy VARCHAR(25)       NOT NULL,
          content text,
          identifier VARCHAR(10),
          isDeleted bit,
          timestamp DATETIME        NOT NULL,
          updated timestamp         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (addedBy) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS log_helperclear
        (
          id int                    NOT NULL AUTO_INCREMENT,
          userID VARCHAR(25)        NOT NULL,
          clearedBy VARCHAR(25)       NOT NULL,
          channel VARCHAR(25),
          amount TINYINT,
          identifier VARCHAR(10),
          timestamp DATETIME        NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (clearedBy) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `INSERT IGNORE INTO messageTypes (id, type) VALUES (1, "create"), (2, "edit"), (3, "delete")`,
        function(err, results){
          if(err) throw err;
        }
  );
  connection.query(
    `INSERT IGNORE INTO voiceTypes (id, type) VALUES (1, "join"), (2, "move"), (3, "leave")`,
        function(err, results){
          if(err) throw err;
        }
  );
}
function parseUserTag(tag){
  /*
  ######################################################################
  ##         Here we are able to parse the users' tag from args       ##
  ##                                                                  ##
  ##                         Possible formats:                        ##
  ##                               <@ID>                              ##
  ##                               <@!ID>                             ##
  ##                                 ID                               ##
  ##                                                                  ##
  ##       All formats will return a raw ID number, unless err.       ##
  ######################################################################
  */
  var trimMe = tag.trim();

  if(/(<@(!)*)+\w+(>)/.test(tag)){
    return trimMe.replace(/[^0-9.]/gi, '')
  }else if(/^[0-9]+$/.test(tag)){
    return trimMe;
  }else{
    var usernameResolve = client.users.find(obj => obj.username === tag);
    var nicknameResolve = client.users.find(obj => obj.nickname === tag);
    if(usernameResolve){return usernameResolve.id;}else if(nicknameResolve){return nicknameResolve.id;}else{return "err";}
  }
}
function updateUserTable(invoker, channel){
  var memberArray = [];
  var guild = client.guilds.get(config.guildid);

  guild.fetchMembers().then(r => {
        r.members.array().forEach(r => {
          memberArray.push([r.user.id, r.user.username, r.user.avatar, 1, r.joinedAt]);
        });
          connection.query(
            'INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES ?', [memberArray],
            function(err, results){
              if(err) throw err;
              if(results){
                switch(invoker){
                  case "user":
                    client.channels.get(channel).send({embed: {
                          color: 3447003,
                          author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                          },
                          title: "[COMMAND] User update",
                          description: "Users that are not known to the database will be added.",
                          fields: [{
                              name: "Total users found",
                              value: " " + memberArray.length
                            },
                            {
                              name: "Total users inserted",
                              value: " " + results.affectedRows,
                              inline: true
                            },
                            {
                              name: "Note",
                              value: "If the amount of users inserted is `0`, this is most likely due to the database already being up to date, not an error."
                            },
                          ],
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                      }
                    );
                    break;
                  case "system":
                    console.log("[INFO] Found " + memberArray.length + " users. Users that are not in the database will be added now.");
                    break;
                }
              }
            }
          );
      }
  )
}
function parseChannelTag(tag){
  var trimMe = tag.trim();

  if(/(<#(!)*)+\w+(>)/.test(tag)){
    return trimMe.replace(/[^0-9.]/gi, '')
  }else if(/^[0-9]+$/.test(tag)){
    return trimMe;
  }else{
    return "err";
  }
}
function updateGuildBansTable(invoker, channel){
  var banArray = [];
  var guild = client.guilds.get(config.guildid);

  guild.fetchBans().then(bans =>{
    bans.array().forEach(ban => {
      banArray.push([ban.id, ban.username, ban.discriminator, "SYSTEM", null, null, new Date()]);
    });
    connection.query(
      'INSERT IGNORE INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, timestamp) VALUES ?', [banArray],
      function(err, results){
        if(err) throw err;
        if(results){
          switch(invoker){
            case "user":
              client.channels.get(channel).send({embed: {
                    color: 3447003,
                    author: {
                      name: client.user.username,
                      icon_url: client.user.displayAvatarURL
                    },
                    title: "[COMMAND] Bans update",
                    description: "Bans that are not known to us will be added to the database",
                    fields: [{
                        name: "Total bans found",
                        value: " " + banArray.length
                      },
                      {
                        name: "Total bans inserted",
                        value: " " + results.affectedRows,
                        inline: true
                      },
                      {
                        name: "Note",
                        value: "If the amount of bans inserted is `0`, this is most likely due to the database already being up to date, not an error."
                      },
                    ],
                    timestamp: new Date(),
                    footer: {
                      text: "Marvin's Little Brother | Current version: " + config.version
                    }
                  }
                }
              );
              break;
            case "system":
              console.log("[INFO] Found " + banArray.length + " bans / Inserted " + results.affectedRows + " rows. Bans that are not in the database will be added now. ");
              break;
          }
        }
      }
    );
  });
}
function syntaxErr(message, command){
  message.channel.send(`There is a problem in your syntax. If you need help, use ${config.prefix}help ${command} \n\n *😫 pst, the help command isn't a thing yet, sorry!*`).
    then(msg => {
      setTimeout(async ()=>{
        await message.delete();
        await msg.delete();
      }, 7000)
    }).catch(console.error);
}
function isNull(value, def){
  if(!value || (value === undefined || value === null)){
    return def;
  }else{
    return value;
  }
}

client.on("ready", () => {
  setupTables();
  console.log("Bot Active");

  client.user.setPresence({
    status: 'away'
  })

  updateUserTable("system", null);

  var file = bannedUsersFile.get();
  for(var key in file){
    bannedUsersArray.push(file[key]);
  }

});

client.on('message', async message => {
  if(message.author.bot) return; //If the author is a bot, return. Avoid bot-ception

  //Log every message that is processed; message or command.
	var data = [message.author.id, message.id, message.content, '', message.channel.id, 1, new Date()]
	connection.query(
	  'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
    function(err, results){
      if(err) throw err;
    }
	);

  if(message.content.indexOf(config.prefix) !== 0) return; //If the message content doesn't start with our prefix, return.

  //Example ">ban <TAG> Bad person!"
  const args =      message.content.slice(1).trim().split(" ");   //Result: ["<TAG>", "Bad", "person!"]
  const command =   args.shift().toLowerCase();                   //Result: "ban"
  const guild =     client.guilds.get(config.guildid);

  //fun commands
  if(command === "flipacoin"){
    if(modulesFile.get("COMMAND_FLIPACOIN")){
      var outcome = Math.floor(Math.random() * Math.floor(2));

      switch(outcome){
        case 0:
          message.channel.send("Heads!");
          break;
        case 1:
          message.channel.send("Tails!");
          break;
      }
    }else{
      message.channel.send("That module ("+command+") is disabled");
    }
  }
  //utility commands
  if(command === "module"){
    if(message.member.roles.some(role=>["Admins"].includes(role.name))){
      if(typeof modulesFile.get(args[0]) != "undefined"){ //Checks if the module provided exists
        if(!isNaN(parseInt(args[1])) && ([0,1].includes(parseInt(args[1])))){ //Parses the string as an int, then checks if the result is valid <Int> & it's either a 0 or 1
          modulesFile.set(args[0], parseInt(args[1]));
          modulesFile.save();

          message.channel.send({embed: {
                color: 10921638,
                author: {
                  name: client.user.username,
                  icon_url: client.user.displayAvatarURL
                },
                title: "[COMMAND] Module update",
                description: args[0] + " was set to status " + args[1],
                timestamp: new Date(),
                footer: {
                  text: "Marvin's Little Brother | Current version: " + config.version
                }
              }
            }
          );
        }else{
          message.channel.send("Please provide a numeric value. **On:** 1 or **Off:** 0")
        }
      }else{
        message.channel.send("That module was not found. Consider using >listmodules");
      }
    }//End of permission checking statement
  }

  if(command === "listmodules"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      var file = modulesFile.get();
      var moduleNames = [];
      var moduleValues = [];
      var formattedModules = [];

      for(var key in file){
        moduleNames.push(key);
        moduleValues.push(file[key]);
      }

      message.channel.send({embed: {
            color: 4305821,
            author: {
              name: client.user.username,
              icon_url: client.user.displayAvatarURL
            },
            title: "[COMMAND] List Modules",
            fields: [{
                name: "Module",
                value: moduleNames.join("\n"),
                inline: true
              },
              {
                name: "State",
                value: moduleValues.join("\n"),
                inline: true
              },
              {
                name: "Note",
                value: "If you would like a module enabling/disabling. Please ask an Admin."
              },
            ],
            timestamp: new Date(),
            footer: {
              text: "Marvin's Little Brother | Current version: " + config.version
            }
          }
        }
      );
    }//End of permission checking statement
  }

  if(command === "users"){
    if(args[0] == "count"){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        if(modulesFile.get("COMMAND_USER_COUNT")){
          connection.query(
            'SELECT COUNT(*) AS TotalUsers FROM users',
            function(err, result){
              if(err) throw err;
              if (result) message.channel.send({embed: {
                    color: 3447003,
                    author: {
                      name: client.user.username,
                      icon_url: client.user.displayAvatarURL
                    },
                    title: "[COMMAND] User count",
                    description: "The current count of users known to us",
                    fields: [{
                        name: "Total user count",
                        value: result[0].TotalUsers
                      },
                      {
                        name: "Note",
                        value: "This list includes users past and present."
                      }
                    ],
                    timestamp: new Date(),
                    footer: {
                      text: "Marvin's Little Brother | Current version: " + config.version
                    }
                  }
                }
              );
            }
          );
        }else{
          message.channel.send("That module ("+command+") is disabled");
        }
      }//End of permission checking statement
    }
    if(args[0] == "update"){
      if(message.member.roles.some(role=>["Admins"].includes(role.name))){
        if(modulesFile.get("COMMAND_USER_UPDATE")){
          updateUserTable("user", message.channel.id);
        }else{
          message.channel.send("That module ("+command+") is disabled");
        }
      }
    }
  }

  if(command === "ban"){
    if(modulesFile.get("COMMAND_BAN")){
      if(message.member.roles.some(role=>["Admins", "Full Mods"].includes(role.name))){
        if(args[0]){
          var user = parseUserTag(args[0]);
        }else{
          message.channel.send("Ban who? **YOU!?**. Format:`>ban <UserTag> <Reason>`")
          return
        }

        if(user == "err"){ //Check if the user parameter is valid
          message.channel.send("An invalid user was provided. Please try again");
        }else{
          if(guild.member(user)){ //Check if the user exists in the guild
            if(message.member.highestRole.comparePositionTo(guild.member(user).highestRole) > 0){
              var tail = args.slice(1);
              var reason = tail.join(" ").trim();

              if(tail.length > 0){
                guild.ban(user, { days: 1, reason: reason }).then(async result => {
                  var identifier = cryptoRandomString(10);
                    await message.channel.send({embed: {
                          color: 9911513,
                          author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                          },
                          title: "[Action] Ban" ,
                          description: `${client.users.get(user).username} been successfully banned`,
                          fields: [{
                              name: "ID",
                              value: result.id,
                              inline: true
                            },
                            {
                              name: "Username",
                              value: result.username,
                              inline: true
                            },
                            {
                              name: "Reason",
                              value: reason
                            },
                            {
                              name: "Banned by",
                              value: message.author.username
                            },
                          ],
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });

                    var data = [result.id, result.username, result.discriminator, message.author.id, reason, null, identifier, new Date()];
                    connection.query(
                      'INSERT INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, identifier, timestamp) VALUES (?,?,?,?,?,?,?,?)', data,
                      function(err, results){
                        if(err) throw err;
                      }
                    );

                    //Adding the user to our banned users JSON
                      //var banndUsers = bannedUsersFile.get();
                      //var next = 1 + _.size(banndUsers);
                    bannedUsersFile.set(identifier, result.username);
                    bannedUsersFile.save();
                  })
                  .catch(console.error);
              }
              else{
                message.channel.send("Please provide a reason for the ban");
              }
            }else{
              message.channel.send("You can not ban a user with a higher role than yourself");
            }
          }else{
            message.channel.send("The user provided was not found in this guild");
          }
        }
      }//End of permission checking statement
    }else{
      message.channel.send("That module ("+command+") is disabled");
    }
  }

  if(command === "unban"){
    if(modulesFile.get("COMMAND_UNBAN")){
      if(message.member.roles.some(role=>["Admins", "Full Mods"].includes(role.name))){
        if(args[0]){
          var user = parseUserTag(args[0]);
        }else{
          message.channel.send("Unban who?\n Format:`>unban <UserTag> <Reason>`")
          return
        }

        if(user == "err"){ //Check if the user parameter is valid
          message.channel.send(":thinking: An invalid user was provided. Please try again");
        }else{
          if(client.fetchUser(user)){
            var tail = args.slice(1);
            var reason = tail.join(" ").trim();

            if(tail.length > 0){
              guild.unban(user, reason).then(result => {
                var identifier = cryptoRandomString(10);
                  message.channel.send({embed: {
                        color: 9911513,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.displayAvatarURL
                        },
                        title: `[Action] Unban` ,
                        description: "The user provided has been successfully unbanned",
                        fields: [{
                            name: "ID",
                            value: result.id,
                            inline: true
                          },
                          {
                            name: "Username",
                            value: result.username,
                            inline: true
                          },
                          {
                            name: "Reason",
                            value: reason
                          },
                          {
                            name: "Unbanned by",
                            value: message.author.username
                          },
                        ],
                        timestamp: new Date(),
                        footer: {
                          text: "Marvin's Little Brother | Current version: " + config.version
                        }
                      }
                  });

                  var data = [result.id, result.username, result.discriminator, message.author.id, reason, null, identifier, new Date()];
                  connection.query(
                    'INSERT INTO log_guildunbans (userID, username, discriminator, unbannedBy, reason, note, identifier, timestamp) VALUES (?,?,?,?,?,?,?,?)', data,
                    function(err, results){
                      if(err) throw err;
                    }
                  );
                  connection.query('select identifier from log_guildbans where userid = ? order by timestamp desc limit 1', result.id, function(err, rows, results){
                    if(err) throw err;

                    //var file = bannedUsersFile.get();
                    bannedUsersFile.set(rows[0].identifier, '')
                    bannedUsersFile.save();
                  });
                })
              .catch(err => {
                if(err.message === "Unknown Ban"){
                  message.channel.send("That user doesn't appear to be banned");
                }else{
                  console.log(err);
                }
              });
            }else{
              message.channel.send("Please provide a reason for the unban")
            }
          }else{
            message.channel.send("Could not find a Discord user with that tag/ID")
          }
        }
      }//End of permission checking statement
    }else{
      message.channel.send(`That module (${command}) is disabled`);
    }
  }

  if(command === "note"){
    if(modulesFile.get("COMMAND_NOTE")){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        if(args[0]){
          var user = parseUserTag(args[0]);
        }else{
          message.channel.send("Format: `>note [User ID] [Note content]`");
          return;
        }

        if(user == "err"){
          message.channel.send("An invalid user was provided. Please try again");
        }else{
          if(guild.member(user)){
            var tail = args.slice(1);
            var note = tail.join(" ").trim();

            if(tail.length > 0){
              var identifier = cryptoRandomString(10);
              var data = [user, message.author.id, note, identifier, 0, new Date(), new Date()];
              connection.query(
                'INSERT INTO log_note (userID, addedBy, note, identifier, isDeleted, timestamp, updated) VALUES (?,?,?,?,?,?,?)', data,
                function(err, results){
                  if(err) throw err;

                  message.channel.send({embed: {
                        color: 9911513,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.displayAvatarURL
                        },
                        title: "[Action] Note added" ,
                        description: `A note was added to ${client.users.get(user)} by ${message.author}`,
                        fields: [{
                            name: "Content",
                            value: note
                          },
                        ],
                        timestamp: new Date(),
                        footer: {
                          text: "Marvin's Little Brother | Current version: " + config.version
                        }
                      }
                  });
                }
              );
            }else{
              message.channel.send("The note needs a reason!");
            }
          }else{
            message.channel.send("The user provided was not found in this guild");
          }
        }
      }//End of permission checking statement
    }else{
      message.channel.send(`That module (${command}) is disabled`);
    }
  }

  if(command === "cnote"){
    if(args[0].length == 10){
      connection.query('UPDATE log_note SET isDeleted = 1 WHERE identifier = ?', args[0].trim(), function(err, results, rows){
        if(err) throw err;
        if(results.affectedRows == 1){
          message.channel.send(`☑ Note with id \`${args[0].trim()}\` was successfully cleared.`)
        }else{
          message.channel.send(`A note with that ID could not be found`)
            .then(msg => {
              setTimeout(async ()=>{
                await msg.delete();
                await message.delete();
              }, 6000)
            }).catch(console.error)
        }
      });
    }else{
      syntaxErr(message, "cnote");
    }
  }

  if(command === "user"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      var userID = parseUserTag(args[0]);
      var userObj = guild.member(client.users.get(userID));

      var nickname;
      if(userObj.user.displayName){nickname = userObj.user.displayName}else{nickname="No nickname"};

      var voiceChannel;
      if(userObj.voiceChannel){voiceChannel = userObj.voiceChannel.name}else{voiceChannel="Not in a voice channel"};

      var app;
      if(userObj.user.presence.game){app = userObj.user.presence.game.name}else{app="None"};

      message.channel.send({embed: {
            color: 14499301,
            author:{
              name: `${userObj.user.username} (${nickname})`,
              icon_url: userObj.user.displayAvatarURL
            },
            description: `${userObj.user.username} joined the guild on ${userObj.joinedAt}`,
            thumbnail: {
              url: userObj.user.displayAvatarURL
            },
            fields: [
              {
                name:"Created",
                value:userObj.user.createdAt
              },
              {
                name:"Status",
                value: `${(userObj.user.presence.status).toUpperCase()}`,
                inline: true
              },
              {
                name:"Application",
                value:`${app}`,
                inline: true
              },
              {
                name:"Voice channel",
                value:`${voiceChannel}`
              }
            ],
            timestamp: new Date(),
            footer: {
              text: "Marvin's Little Brother | Current version: " + config.version
            }
          }
      }).then(async msg => {
        await msg.react("👥");
        await msg.react("👮");
        await msg.react("✍");
        await msg.react("❌");

        const filter = (reaction, user) => user.bot == false;
        const collector = msg.createReactionCollector(filter);

        collector.on('collect', async r =>{
          if(r.emoji.name == "👮"){
            await r.remove(r.users.last());

            connection.query('select * from log_warn where userID = ? and isDeleted = 0', userID, async function(err, rows, results){
              if(err) throw err;
              var warnings = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                await warnings.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.addedBy)} on ${row.timestamp} \n \`\`\`${row.content}\`\`\`\n\n`)
              }

              msg.edit({embed: {
                    color: 14499301,
                    author:{
                      name: `${userObj.user.username} (${nickname})`,
                      icon_url: userObj.user.displayAvatarURL
                    },
                    description: warnings.join(" "),
                    timestamp: new Date(),
                    footer: {
                      text: "Marvin's Little Brother | Current version: " + config.version
                    }
                  }
              });
            });
          }else if(r.emoji.name == "❌"){
            msg.delete();
            message.delete();
          }else if(r.emoji.name == "✍"){
            await r.remove(r.users.last());
            connection.query('select * from log_note where userID = ? and isDeleted = 0', userID, async function(err, rows, results){
              if(err) throw err;
              var notes = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.addedBy)} on ${row.timestamp} \n \`\`\`${row.note}\`\`\`\n\n`)
              }

              msg.edit({embed: {
                    color: 14499301,
                    author:{
                      name: `${userObj.user.username} (${nickname})`,
                      icon_url: userObj.user.displayAvatarURL
                    },
                    description: notes.join(" "),
                    timestamp: new Date(),
                    footer: {
                      text: "Marvin's Little Brother | Current version: " + config.version
                    }
                  }
              });
            });
          }else if(r.emoji.name == "👥"){
            await r.remove(r.users.last());
            msg.edit({embed: {
                  color: 14499301,
                  title: `${userObj.user.username} (${nickname})`,
                  description: `${userObj.user.username} joined the guild on ${userObj.joinedAt}`,
                  thumbnail: {
                    url: userObj.user.displayAvatarURL
                  },
                  fields: [
                    {
                      name:"Created",
                      value:userObj.user.createdAt
                    },
                    {
                      name:"Status",
                      value: userObj.user.presence.status,
                      inline: true
                    },
                    {
                      name:"Application",
                      value:`${app}`,
                      inline: true
                    },
                    {
                      name:"Voice channel",
                      value:`${voiceChannel}`
                    }
                  ],
                  timestamp: new Date(),
                  footer: {
                    text: "Marvin's Little Brother | Current version: " + config.version
                  }
                }
            });
          }else{return;}
        });
        //collector.on('end');
      }).catch(console.error)
    }else{
      return;
    }
  }

  if(command === "warn"){
    if(modulesFile.get("COMMAND_WARN")){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        if(args[0]){
          var user = parseUserTag(args[0]);
        }else{
          syntaxErr(message, "warn");
          return;
        }

        if(user == "err"){
          message.channel.send("An invalid user was provided. Please try again");
        }else{
          if(guild.member(user)){
            var tail = args.slice(1);
            var content = tail.join(" ").trim();

            if(tail.length > 0){
              var identifier = cryptoRandomString(10);
              var data = [user, message.author.id, content, 0, identifier, new Date(), new Date()];
              connection.query('INSERT INTO log_warn (userID, addedBy, content, isDeleted, identifier, timestamp, updated) VALUES (?,?,?,?,?,?,?)', data,
                function(err, results){
                  if(err) throw err;

                  message.channel.send({embed: {
                        color: 9911513,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.displayAvatarURL
                        },
                        title: "[Action] Warning added" ,
                        description: `A warning was added to ${client.users.get(user)} by ${message.author}`,
                        fields: [{
                            name: "Reason",
                            value: content
                          },
                          {
                            name: "Identifier",
                            value: identifier
                          },
                        ],
                        timestamp: new Date(),
                        footer: {
                          text: "Marvin's Little Brother | Current version: " + config.version
                        }
                      }
                  });

                  client.users.get(user).createDM().then(async chnl => {
                    await chnl.send({embed: {
                          color: 15059763,
                          title:`You have been warned in ${guild.name}` ,
                          description: `Reasons and details about the warning can be found below:`,
                          fields: [{
                              name: "Reason",
                              value: content
                            },
                            {
                              name: "Identifier",
                              value: `\`${identifier}\``
                            },
                            {
                              name: "Want to dispute?",
                              value: "This warning can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message. \nThank you."
                            }
                          ],
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    }).then(dm => {
                      var data = [user, dm.content, 1, 0, identifier, new Date(), new Date()];
                      connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data, function(err, results){if(err) throw err;})
                    });
                  }).catch(console.error);
                }
              );
            }else{
              message.channel.send("The warning needs a reason!");
            }
          }else{
            message.channel.send("The user provided was not found in this guild");
          }
        }
      }//End of permission checking statement
    }else{
      message.channel.send(`That module (${command}) is disabled`);
    }
  }

  if(command === "cwarn"){
    if(args[0].length == 10){
      connection.query('UPDATE log_warn SET isDeleted = 1 WHERE identifier = ?', args[0].trim(), function(err, results, rows){
        if(err) throw err;
        if(results.affectedRows == 1){
          message.channel.send(`☑ Warning with id \`${args[0].trim()}\` was successfully cleared.`)
        }else{
          message.channel.send(`A warning with that ID could not be found`)
            .then(msg => {
              setTimeout(async ()=>{
                await msg.delete();
                await message.delete();
              }, 6000)
            }).catch(console.error)
        }
      });
    }else{
      syntaxErr(message, "cwarn");
    }
  }

  if(command === "helper"){
    if(args[0] === "clear"){
      if(modulesFile.get("COMMAND_HELPER_CLEAR")){
        if(message.member.roles.some(role=>["Moderators", "Support"].includes(role.name))){
          if(args.length >= 4){
            var amount = args[1];
            var channelid = parseChannelTag(args[2]);
            var userid = parseUserTag(args[3])

            var channel = guild.channels.get(channelid);
            var user = client.users.get(userid);
            var deleted = 0;

            if(user && guild.member(user)){
              channel.fetchMessages({limit: 100})
                .then(async a => {
                  await channel.bulkDelete(a.filter(b => b.author.id == user.id).first(parseInt(amount)))
                    .then(result => deleted = result.size)
                    .catch(console.error);

                  if(deleted > 0){
                    var identifier = cryptoRandomString(10);
                    guild.channels.find(chnl => chnl.name === "helpers").send({embed: {
                          color: 4514375,
                          title:`[Action] Messages cleared` ,
                          description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}\n\nThis action was carried out by ${message.author}\n`,
                          timestamp: new Date(),
                          footer: {
                            text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                         }
                       }
                    });
                    var data = [user.id, message.author.id, channel.id, deleted, identifier, new Date()];
                    connection.query('INSERT INTO log_helperclear(userID, clearedBy, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data, function(err, results){
                      if(err) throw err;
                    });
                  }else{
                    message.channel.send("The command executed successfully but no messages were removed. Ensure the correct channel was used.")
                      .then(msg => {
                        setTimeout(()=>{
                          msg.delete();
                        }, 5000);
                      }).catch(console.error)

                  }
               }).catch(console.error)
            }else{
              message.channel.send("The user provided was not found in this guild");
            }
         }else{
           syntaxErr(channel, message, command);
         }
       }
      }else{
        message.channel.send(`That module (${command}) is disabled`);
      }
    }
  }

  if(command === "voicelog"){
      if(modulesFile.get("COMMAND_VOICELOG")){
        if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
          if(args[0]){
            var user = parseUserTag(args[0]);
          }else{
            syntaxErr(message, "voicelog");
            return;
          }

          if(user == "err"){
            message.channel.send("An invalid user was provided. Please try again");
          }else{
            connection.query('select * from log_voice where userID = ? ORDER BY timestamp DESC LIMIT 25', user, async function(err, rows, results){
              if(err) throw err;

              var times = [];
              var current = [];
              var timestamps = [];
              var msg = ["Channel        |                     Timestamp                     | Duration (H:M:S)",
                         "------------------------------------------------------------------------------------------------"];
              for (var i = rows.length - 1; i >= 0; i--) {
                var row = rows[i];

                if(rows[i-1]){
                  if(row.type !== 3){
                    var next = rows[i-1];
                    var time1 = row.timestamp;
                    var time2 = next.timestamp;

                    var diff = time2.getTime() - time1.getTime();

                    var msec = diff;
                    var hh = Math.floor(msec / 1000 / 60 / 60);
                    msec -= hh * 1000 * 60 * 60;
                    var mm = Math.floor(msec / 1000 / 60);
                    msec -= mm * 1000 * 60;
                    var ss = Math.floor(msec / 1000);
                    msec -= ss * 1000;

                    times.push(`${hh}:${mm}:${ss}`);
                    current.push(row.newChannel);
                    timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                  }
                }else if(!rows[i-1] && ([1,2].indexOf(row.type) > -1)){
                  current.push(row.newChannel)
                  times.push("Active");
                  timestamps.push(`${row.timestamp.toUTCString()} (${moment(row.timestamp.toUTCString()).fromNow()})`);
                }else{
                }
              }
              times.reverse();
              current.reverse();
              timestamps.reverse();

              var longest = 0;
              for(var i = 0; i < current.length; i++){
                if(current[i].length > longest){
                  longest = current[i].length;
                }
              }
              for(var j = 0; j < current.length; j++){
                var howManyToAdd = longest - current[j].length;
                current[j] = current[j].padEnd(current[j].length + howManyToAdd + 1);
              }

              var longestTime = 0;
              for(var i = 0; i < timestamps.length; i++){
                if(current[i].length > longestTime){
                  longestTime = timestamps[i].length;
                }
              }
              for(var j = 0; j < timestamps.length; j++){
                var howManyToAdd = longestTime - timestamps[j].length;
                timestamps[j] = timestamps[j].padEnd(timestamps[j].length + howManyToAdd + 1);
              }

              for(var i = 0; i < times.length; i++){
                msg.push(`${current[i]}|     ${timestamps[i]}     | ${times[i]}`)
              }
              var joinedMessage = msg.join('\n')
              message.channel.send(`🎙 Viewing the voice logs of ${client.users.get(user)} \`\`\`${joinedMessage}\`\`\``);
            });
          }
        }//END OF PERMISSION CHECK
      }else{
        //DISABLED MODULE
      }
    }
});
//discord events
client.on('messageUpdate', function(oldMessage, newMessage) {
  if(modulesFile.get("EVENT_MESSAGE_UPDATE")){
    if(newMessage.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    var data = [newMessage.author.id, newMessage.id, newMessage.content, oldMessage.content, newMessage.channel.id, 2, new Date()]
    connection.query(
      'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
      function(err, results){
        if(err) throw err;
      }
    );
  }else{
    //EVENT IS NOT ONLINE!!
  }
})

client.on('messageDelete', function(message) {
  if(modulesFile.get("EVENT_MESSAGE_DELETE")){
    if(message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
    var data = [message.author.id, message.id, '', message.content, message.channel.id, 3, new Date()]
    connection.query(
      'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
      function(err, results){
        if(err) throw err;
      }
    );
  }else{
    //EVENT IS NOT ONLINE!!
  }
})

client.on('guildMemberAdd', function(member) {
  if(modulesFile.get("EVENT_GUILD_MEMBER_ADD")){
    var params = [member.user.id, member.user.username, member.user.avatar, 1, new Date(), new Date(), member.user.id, member.user.id, member.user.username, new Date()]
    connection.query(
      `
      INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp, updated) VALUES (?,?,?,?,?,?);
      UPDATE users SET exist = 1 WHERE userID = ?;
      INSERT INTO log_guildjoin (userID, joinedAs, timestamp) VALUES (?,?,?);
      `, params,
      function(err, results){
        if(err) throw err;
      }
    );
  }else{
    //EVENT IS NOT ONLINE!!
  }

  if(modulesFile.get("EVENT_BANNDUSER_DETEC")){
    var guild       = client.guilds.get(config.guildid);
    var banndUsers  = bannedUsersFile.get();
    var usernames   = _.values(banndUsers);

    var match = stringSimilarity.findBestMatch(member.user.username, usernames);

    if(match.bestMatch.rating > 0.6){
      guild.channels.find(val => val.name === 'server-log').send(`❗ A potential ban evasion was detected. User ${member.user} matched **${match.bestMatch.target}** with a similarity of ~${match.bestMatch.rating}`);
    }
  }
})

client.on('guildMemberRemove', function(member) {
  if(modulesFile.get("EVENT_GUILD_MEMBER_LEAVE")){
    var data = [member.user.id, new Date()]
    var userLeave = [0, new Date(), member.user.id]

    connection.query(
      'INSERT INTO log_guildleave (userID, timestamp) VALUES (?,?)', data,
      function(err, results){
        if(err) throw err;
      }
    );
    connection.query(
      'UPDATE users SET exist = ?, updated = ? WHERE userID = ?', userLeave,
      function(err, results){
        if(err) throw err;
      }
    );
  }else{
    //EVENT IS NOT ONLINE!!
  }
})

client.on('voiceStateUpdate', function(oldMember, newMember) {
  if(modulesFile.get("EVENT_GUILD_VOICE_UPDATES")){
    var data = []
    // if(oldMember.voiceChannel){
    //   if(newMember.voiceChannel && (newMember.voiceChannel.id !== oldMember.voiceChannel.id)){
    //     data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, oldMember.voiceChannel.id, oldMember.voiceChannel.name, 2, new Date()]
    //   }else if(newMember.voiceChannel.id !== oldMember.voiceChannel.id && newMember.mute !== mute){
    //     data = [newMember.id, '', '', oldMember.voiceChannel.id, oldMember.voiceChannel.name, 3, new Date()]
    //   }else{
    //     console.log("Mute");
    //   }
    // }else{
    //   if(newMember.voiceChannel){
    //     data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, '', '', 1, new Date()]
    //   }else{
    //     data = [newMember.id, 'UNKNOWN', 'UNKNOWN', '', '', 1, new Date()]
    //   }
    // }

    if(oldMember.voiceChannel){ //Were in a channel to begin with
      if(newMember.voiceChannel){
        if(oldMember.voiceChannel.id !== newMember.voiceChannel.id){
          data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, oldMember.voiceChannel.id, oldMember.voiceChannel.name, 2, new Date()]
        }else{
          return;
        }
      }else{
        data = [newMember.id, '', '', oldMember.voiceChannel.id, oldMember.voiceChannel.name, 3, new Date()]
      }
    }else{
      if(newMember.voiceChannel){
        data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, '', '', 1, new Date()]
      }else{
        data = [newMember.id, 'UNKNOWN', 'UNKNOWN', '', '', 1, new Date()]
      }
    }
    if(data.length > 0){
      connection.query(
        'INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)', data,
        function(err, results){
          if(err) throw err;
        }
      );
    }
  }else{
    //EVENT IS NOT ONLINE!!
  }
})

client.on('userUpdate', function(oldUser, newUser) {
  if(modulesFile.get("EVENT_USER_UPDATE")){
    //Checking for username changes for logging
    	if(oldUser.username!==newUser.username){
    		var data = [newUser.id, newUser.username, oldUser.username, new Date()]
    		connection.query(
    		  'INSERT INTO log_username (userID, newUsername, oldUsername, timestamp) VALUES (?,?,?,?)', data,
          function(err, results){
            if(err) throw err;
          }
    		);
    	}

    //Checking for avatar changes to update user table
      if(oldUser.avatar !== newUser.avatar){
        var data = [newUser.avatar, new Date(), newUser.id]
        connection.query(
          'UPDATE users SET avatar = ?, updated = ? WHERE userID = ?', data,
          function(err, results){
            if(err) throw err;
          }
        );
      }
  }else{
    //EVENT IS NOT ONLINE!!
  }
})

client.on('guildMemberUpdate', function(oldMember, newMember) {
  if(modulesFile.get("EVENT_GUILD_MEMBER_UPDATE")){
    //Checking for nickname changes for logging
    	if(oldMember.displayName !== newMember.displayName){
    		var data = [newMember.user.id, newMember.user.username, newMember.displayName, oldMember.displayName, new Date()]
    		connection.query(
    		  'INSERT INTO log_nickname (userID, username, newnickname, oldnickname, timestamp) VALUES (?,?,?,?,?)', data,
          function(err, results){
            if(err) throw err;
          }
    		);
    	}
  }else{
    //EVENT IS NOT ONLINE!!
  }
});

client.on('guildBanAdd', function(guild, user){
  var identifier = cryptoRandomString(10);
  bannedUsersFile.set(identifier, user.username)
  bannedUsersFile.save();

  var data = [user.id, user.username, user.discriminator, '001', null, "THIS WAS A SYSTEM BAN", identifier, new Date()];
  connection.query(
    'INSERT INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, identifier, timestamp) VALUES (?,?,?,?,?,?,?,?)', data,
    function(err, results){
      if(err) throw err;
    }
  );
});

client.on('error', console.error);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

client.login(config.token);
