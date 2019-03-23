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
var guild;
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

var mutedFile             = editJsonFile("./muted.json");
var reminderFile            = editJsonFile("./reminders.json");


var badWordList;

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
          new VARCHAR(255),
          old VARCHAR(255),
          timestamp DATETIME        NOT NULL,
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
          new VARCHAR(255),
          old VARCHAR(255),
          timestamp DATETIME        NOT NULL,
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
          timestamp DATETIME,
          FOREIGN KEY (userID) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_0900_ai_ci';`,
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
        COLLATE 'utf8mb4_0900_ai_ci';`,
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
        function(err, results){
          if(err) throw err;
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
  - Function used for parsing multiple types of the <user> argument
  - Valid entries: <@number>, <@!number>, number, username/nickname (will attempt to resolve to a user)

  returns @id <int>
  */
  var trimMe = tag.trim();

  if(/(<@(!)*)+\w+(>)/.test(tag)){
    return trimMe.replace(/[^0-9.]/gi, '')
  }else if(/[\w\d\\\/\_\|]+(#\d\d\d\d)+$/.test(tag)){
    var split = tag.split("#");
    var usernameResolve = client.users.find(obj => obj.username === split[0]);

    if(usernameResolve.discriminator == split[1]){
      return usernameResolve.id;
    }else{
      return "err";
    }
  }else if(/^[0-9]+$/.test(tag)){
    return trimMe;
  }else{
    var usernameResolve = client.users.find(obj => obj.username === tag);
    var nicknameResolve = client.users.find(obj => obj.nickname === tag);

    if(usernameResolve){return usernameResolve.id;}else if(nicknameResolve){return nicknameResolve.id;}else{return "err";}
  }
}
function parseChannelTag(tag){
  /*
  - Function used for parsing multiple types of the <channel> argument

  returns @id <int>
  */
  var trimMe = tag.trim();

  if(/(<#(!)*)+\w+(>)/.test(tag)){
    return trimMe.replace(/[^0-9.]/gi, '')
  }else if(/^[0-9]+$/.test(tag)){
    return trimMe;
  }else{
    return "err";
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
                          color: config.color_success,
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
function updateGuildBansTable(invoker, channel){
  var banArray = [];
  var guild = client.guilds.get(config.guildid);

  guild.fetchBans().then(bans =>{
    bans.array().forEach(ban => {
      banArray.push([ban.id, ban.username, ban.discriminator, "001", null, "Ban added via a call to updateGuildBansTable", new Date()]);
    });
    connection.query(
      'INSERT IGNORE INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, timestamp) VALUES ?', [banArray],
      function(err, results){
        if(err) throw err;
        if(results){
          switch(invoker){
            case "user":
              client.channels.get(channel).send({embed: {
                    color: config.color_success,
                    author: {
                      name: client.user.username,
                      icon_url: client.user.displayAvatarURL
                    },
                    title: "[COMMAND] Bans update",
                    description: "Bans that are not known to us will be added to the database",
                    fields: [{
                        name: "Total bans found",
                        value: `${bans.size}`,
                        inline: true
                      },
                      {
                        name: "Total bans inserted",
                        value: `${results.affectedRows}`,
                        inline: true
                      },
                      {
                        name: "Note",
                        value: "If the amount of bans inserted is 0, this is most likely due to the database already being up to date, not an error."
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
function checkMessageContent(message){
  if(message.member.roles.some(role=>["Moderators, Subreddit Mods"].includes(role.name))){
    var wholeMessage = (message.content).split(" ");

    if(badWordList.some(word => wholeMessage.includes(word))){
      message.delete()
        .then(() =>{
          message.channel.send(`${message.author} watch your language`)
            .then(msg => {
              setTimeout(async() =>{
                await msg.delete();
              },5000);
            }).catch(console.error);

          var data = [message.author.id, message.channel.id, message.content, new Date()];
          connection.query('INSERT INTO log_messageremovals (userID, channel, message, timestamp) VALUES (?,?,?,?)', data, function(err, results){
            if(err) throw err;
          });
        }).catch(console.error);
    }
  }
}
function checkExpiredMutes(){
  let mutes = mutedFile.read();

  for(var i in mutes){
    if(mutes[i].end < (Math.floor(Date.now() / 1000))){
      var actionee = guild.member(i);
      var mutedRole = guild.roles.find(val => val.name === "Muted");

      if(actionee){
        actionee.removeRole(mutedRole)
          .then(member => {
            guild.channels.find(val => val.name === "server-log-test").send(`${member} has been unmuted`);
            mutedFile.unset(i);
            mutedFile.save();
          })
          .catch(console.error);
      }else{
        console.log(`Actionee could not be found ${i}`);
        mutedFile.unset(i);
        mutedFile.save();
      }
    }
  }
}
function checkReminders(){
  let reminders = reminderFile.read();

  for(var i in reminders){
    if(reminders[i].end < (Math.floor(Date.now() / 1000))){
      var member = guild.member(reminders[i].who);
      if(member){
        member.createDM().then(async chnl => {
          await chnl.send(`Hey ${member}, it's been ${reminders[i].length} since you set a reminder - \n\n ${reminders[i].reminder}`);
          reminderFile.unset(i);
          reminderFile.save();
        }).catch(console.error)
      }else{
        reminderFile.unset(i);
        reminderFile.save();
      }
    }
  }
}

client.on("ready", () => {

  badWordList = (fs.readFileSync('badwords.txt', 'utf8').replace(/\r?\n|\r/g, "")).split(", ")//Load initial list of bad words

  setupTables();
  console.log(`[${new Date()}] Bot Active.`);

  client.user.setPresence({
    status: 'idle'
  })

  updateUserTable("system", null);
  guild = client.guilds.get(config.guildid);

  setInterval(checkExpiredMutes, 10000);
  setInterval(checkReminders, 30000);
});

client.on('message', async message => {
  if(message.author.bot) return; //If the author is a bot, return. Avoid bot-ception
  if(_.indexOf(["dm", "group"], message.channel.type) !== -1) return; //If the message is a DM or GroupDM, return.

  //Log every message that is processed; message or command.
	var data = [message.author.id, message.id, message.content, '', message.channel.id, 1, new Date()];
	connection.query(
	  'INSERT INTO log_message (userID, messageID, newMessage, oldMessage, channel, type, timestamp) VALUES (?,?,?,?,?,?,?)', data,
    function(err, results){
      if(err) throw err;
    }
	);

  if(modulesFile.get("EVENT_CHECKMESSAGECONTENT")){checkMessageContent(message);}

  if(message.content.indexOf(config.prefix) !== 0) return; //If the message content doesn't start with our prefix, return.


  const args =      message.content.slice(1).trim().split(/\s+/);   //Result: ["<TAG>", "Bad", "person!"]
  const command =   args.shift().toLowerCase();                   //Result: "ban"

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
      message.channel.send(`That module (${command}) is disabled.`);;
    }
  }
  //utility commands
  if(command === "module"){
    if(message.member.roles.some(role=>["Admins"].includes(role.name))){
      if(typeof modulesFile.get(args[0]) != "undefined"){ //Checks if the module provided exists
        if([0,1].includes(parseInt(args[1]))){ //Parses the string as an int, then checks if the result is a valid <Int> & it's either a 0 or 1
          modulesFile.set(args[0], parseInt(args[1]));
          modulesFile.save();

          message.channel.send({embed: {
                color: config.color_info,
                title: "🔶 A module was updated",
                description: args[0] + " was set to status " + args[1],
                timestamp: new Date(),
                footer: {
                  text: "Marvin's Little Brother | Current version: " + config.version
                }
              }
            }
          );
        }else{
          message.channel.send(`Please provide a valid status\n\nOff: 0\nOn: 1`)
          .then(msg => {
            setTimeout(async ()=>{
              await msg.delete();
              await message.delete();
            }, 6000)
          }).catch(console.error)
        }
      }else{
        message.channel.send("That module was not found. Consider using >listmodules");
      }
    }//End of permission checking statement
  }

  if(command === "listmodules"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      var file = modulesFile.get();
      var moduleNames = _.keys(file);
      var moduleValues = _.values(file);

      message.channel.send({embed: {
            color: config.color_info,
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
                    color: config.color_info,
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
          message.channel.send(`That module (${command}) is disabled.`);;
        }
      }//End of permission checking statement
    }
    if(args[0] == "update"){
      if(message.member.roles.some(role=>["Admins"].includes(role.name))){
        if(modulesFile.get("COMMAND_USER_UPDATE")){
          updateUserTable("user", message.channel.id);
        }else{
          message.channel.send(`That module (${command}) is disabled.`);;
        }
      }
    }
  }

  if(command === "ban"){
    if(message.member.roles.some(role=>["Admins", "Full Mods"].includes(role.name))){
      if(modulesFile.get("COMMAND_BAN")){
        if(args[0]){
          var user = parseUserTag(args[0]);

          if(user == "err"){ //Check if the user parameter is valid
            message.channel.send("An invalid user was provided. Please try again");
          }else{
            if(guild.member(user)){ //Check if the user exists in the guild
              if(message.member.highestRole.comparePositionTo(guild.member(user).highestRole) > 0){
                var tail = args.slice(1);
                var reason = tail.join(" ").trim();

                if(tail.length > 0){
                  var identifier = cryptoRandomString(10);
                  client.users.get(user).createDM().then(async chnl => {
                    await chnl.send({embed: {
                          color: config.color_warning,
                          title:`You have been banned from ${guild.name}` ,
                          description: `Details about the ban can be found below:`,
                          fields: [{
                              name: "Reason",
                              value: reason
                            },
                            {
                              name: "Identifier",
                              value: `\`${identifier}\``
                            },
                            {
                              name: "Want to dispute?",
                              value: "This ban can be disputed reasonably by contacting us via our subreddit modmail (r/PUBATTLEGROUNDS). Please quote your identifier, which can be found above, in your initial message. Thank you."
                            }
                          ],
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
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
                                title: "[Action] Ban" ,
                                description: `${client.users.get(user)} has been successfully banned`,
                                fields: [{
                                    name: "User ID",
                                    value: result.id,
                                    inline: true
                                  },
                                  {
                                    name: "Username/Discrim",
                                    value: `${result.username}#${result.discriminator}`,
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
        }else{
          syntaxErr(message, "ban")
          return;
        }
      }else{
        message.channel.send(`That module (${command}) is disabled.`);;
      }
    }
  }

  if(command === "unban"){
    if(message.member.roles.some(role=>["Admins", "Full Mods"].includes(role.name))){
      if(modulesFile.get("COMMAND_UNBAN")){
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
                        color: config.color_success,
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
                            name: "Username/Discrim",
                            value: `${result.username}#${result.discriminator}`,
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

                  var data = [result.id, message.author.id, reason, identifier, 0, new Date()];
                  connection.query(
                    'INSERT INTO log_guildunbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
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
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "note"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_NOTE")){
        if(args[0]){
          var user = parseUserTag(args[0]);
        }else{
          message.channel.send("Format: `>note [User ID] [Note content]`");
          return;
        }

        if(user == "err"){
          message.channel.send("An invalid user was provided. Please try again");
        }else{
          var tail = args.slice(1);
          var note = tail.join(" ").trim();

          if(tail.length > 0){
            var identifier = cryptoRandomString(10);
            var data = [user, message.author.id, note, identifier, 0, new Date()];
            connection.query(
              'INSERT INTO log_note (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
              function(err, results){
                if(err) throw err;

                message.channel.send({embed: {
                      color: config.color_success,
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
        }
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "cnote"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_CNOTE")){
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
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "user"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_USER")){
        var userID = parseUserTag(args[0]);
        var globalUser = client.users.get(userID);
        var userObject = guild.member(globalUser);

        if(userObject){
          var nickname;
          var voiceChannel;
          var app;

          if(userObject.user.displayName){nickname = userObject.user.displayName}else{nickname="No nickname"};
          if(userObject.voiceChannel){voiceChannel = userObject.voiceChannel.name}else{voiceChannel="Not in a voice channel"};
          if(userObject.user.presence.game){app = userObject.user.presence.game.name}else{app="None"};

          message.channel.send({embed: {
                color: config.color_info,
                author:{
                  name: `${userObject.user.username} (${nickname})`,
                  icon_url: userObject.user.displayAvatarURL
                },
                description: `${userObject.user.username} joined the guild on ${userObject.joinedAt}`,
                thumbnail: {
                  url: userObject.user.displayAvatarURL
                },
                fields: [
                  {
                    name:"Created",
                    value:userObject.user.createdAt
                  },
                  {
                    name:"Status",
                    value: `${(userObject.user.presence.status).toUpperCase()}`,
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
            await msg.react("🔈");
            await msg.react("✍");
            await msg.react("📥");
            await msg.react("❌");

            const filter = (reaction, user) => user.bot == false;
            const collector = msg.createReactionCollector(filter);

            collector.on('collect', async r =>{
              if(r.emoji.name == "👮"){
                await r.remove(r.users.last());

                connection.query('select * from log_warn where userID = ? and isDeleted = 0 order by timestamp desc', userID, async function(err, rows, results){
                  if(err) throw err;
                  var warnings = [];
                  var max = 5;
                  var extra;

                  if(rows.length <= 5){max = rows.length;}else{extra = rows.length - max;}

                  for (var i = 0; i < max; i++) {
                    var row = rows[i];
                    await warnings.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`);
                    if(i == max - 1 && extra > 0){warnings.push(`...${extra} more`)}
                  }
                  if(!_.isEmpty(warnings)){
                    await msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `Warnings for ${userObject.user.username} (${nickname})`,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: warnings.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: userObject.user.username,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: `There are no recored warnings for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else if(r.emoji.name == "🔈"){
                await r.remove(r.users.last());

                connection.query('select * from log_mutes where userID = ? and isDeleted = 0 order by timestamp desc', userID, async function(err, rows, results){
                  if(err) throw err;
                  var mutes = [];
                  var max = 5;
                  var extra;

                  if(rows.length <= 5){max = rows.length;}else{extra = rows.length - max;}

                  for (var i = 0; i < max; i++) {
                    var row = rows[i];
                    await mutes.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                    if(i == max - 1 && extra > 0){mutes.push(`...${extra} more`)}
                  }
                  if(!_.isEmpty(mutes)){
                    await msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `Mutes for ${userObject.user.username} (${nickname})`,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: mutes.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: userObject.user.username,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: `There are no recored mutes for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else if(r.emoji.name == "❌"){
                msg.delete();
                message.delete();
              }else if(r.emoji.name == "✍"){
                await r.remove(r.users.last());
                connection.query('select * from log_note where userID = ? and isDeleted = 0 order by timestamp desc', userID, async function(err, rows, results){
                  if(err) throw err;
                  var notes = [];
                  for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`)
                  }
                  if(!_.isEmpty(notes)){
                    msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `${userObject.user.username} (${nickname})`,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: notes.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: userObject.user.username,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: `There are no recored notes for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else if(r.emoji.name == "👥"){
                await r.remove(r.users.last());
                msg.edit({embed: {
                      color: config.color_info,
                      title: `${userObject.user.username} (${nickname})`,
                      description: `${userObject.user.username} joined the guild on ${userObject.joinedAt}`,
                      thumbnail: {
                        url: userObject.user.displayAvatarURL
                      },
                      fields: [
                        {
                          name:"Created",
                          value:userObject.user.createdAt
                        },
                        {
                          name:"Status",
                          value: userObject.user.presence.status,
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
              }else if(r.emoji.name == "📥"){
                await r.remove(r.users.last());
                connection.query(`
                  select Status, timestamp
                  from(select *, 'join' as Status from log_guildjoin where userid = ?
                  union
                  select * , 'leave' as Status from log_guildleave where userid = ?
                  ) a
                  order by timestamp desc`, [userID, userID], async function(err, rows, results){
                  if(err) throw err;
                  var history = [];
                  var max = 5;
                  var extra;

                  if(rows.length <= 5){max = rows.length;}else{extra = rows.length - max;}

                  for (var i = 0; i < max; i++) {
                    var row = rows[i];
                    switch(row.Status){
                      case "join":
                        history.push(`📥 ${userObject.user.username} joined at \`${new Date(row.timestamp)}\`\n\n`);
                        break;
                      case "leave":
                        history.push(`📤 ${userObject.user.username} left at \`${new Date(row.timestamp)}\`\n\n`);
                        break;
                    }
                    if(i == max - 1 && extra > 0){history.push(`...${extra} more`)}
                  }
                  if(!_.isEmpty(history)){
                    await msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `Join/Leave history for ${userObject.user.username} (${nickname})`,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: history.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: userObject.user.username,
                            icon_url: userObject.user.displayAvatarURL
                          },
                          description: `There are no join/leave records for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else{return;}
            });
            //collector.on('end');
          }).catch(console.error)
        }else{
          message.channel.send({embed: {
                color: config.color_caution,
                author:{
                  name: globalUser.username,
                  icon_url: globalUser.displayAvatarURL
                },
                title: `${userID}`,
                description: `The user you provided is not currently camping in this guild\n`,
                timestamp: new Date(),
                footer: {
                  text: "Marvin's Little Brother | Current version: " + config.version
                }
              }
          }).then(async msg => {
            await msg.react("👥");
            await msg.react("👮");
            await msg.react("🔈");
            await msg.react("✍");
            await msg.react("📥");
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
                    await warnings.push(`\`${row.identifier}\` ❗ Warning by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`)
                  }
                  if(!_.isEmpty(warnings)){
                    msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: warnings.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: `There are no recored warnings for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }

                });
              }else if(r.emoji.name == "🔈"){
                await r.remove(r.users.last());

                connection.query('select * from log_mutes where userID = ? and isDeleted = 0 order by timestamp desc', userID, async function(err, rows, results){
                  if(err) throw err;
                  var mutes = [];
                  var max = 5;
                  var extra;

                  if(rows.length <= 5){max = rows.length;}else{extra = rows.length - max;}

                  for (var i = 0; i < max; i++) {
                    var row = rows[i];
                    await mutes.push(`\`${row.identifier}\` 🔇 Mute by ${client.users.get(row.actioner)} on ${row.timestamp} for ${row.length}s \n \`\`\`${row.description}\`\`\`\n\n`);
                    if(i == max - 1 && extra > 0){mutes.push(`...${extra} more`)}
                  }
                  if(!_.isEmpty(mutes)){
                    await msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `Mutes for ${globalUser.username}`,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: mutes.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: `There are no recored mutes for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
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
                    await notes.push(`\`${row.identifier}\` 📌 Note by ${client.users.get(row.actioner)} on ${row.timestamp} \n \`\`\`${row.description}\`\`\`\n\n`)
                  }
                  if(!_.isEmpty(notes)){
                    msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: notes.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: `There are no recored notes for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else if(r.emoji.name == "👥"){
                await r.remove(r.users.last());
                msg.edit({embed: {
                      color: config.color_caution,
                      author:{
                        name: globalUser.username,
                        icon_url: globalUser.displayAvatarURL
                      },
                      title: `${userID}`,
                      description: `The user you provided is not currently camping in this guild \n\n More information will be available here soon!`,
                      timestamp: new Date(),
                      footer: {
                        text: "Marvin's Little Brother | Current version: " + config.version
                      }
                    }
                });
              }else if(r.emoji.name == "📥"){
                await r.remove(r.users.last());
                connection.query(`
                  select Status, timestamp
                  from(select *, 'join' as Status from log_guildjoin where userid = ?
                  union
                  select * , 'leave' as Status from log_guildleave where userid = ?
                  ) a
                  order by timestamp desc`, [userID, userID], async function(err, rows, results){
                  if(err) throw err;
                  var history = [];
                  var max = 5;
                  var extra;

                  if(rows.length <= 5){max = rows.length;}else{extra = rows.length - max;}

                  for (var i = 0; i < max; i++) {
                    var row = rows[i];
                    switch(row.Status){
                      case "join":
                        history.push(`📥 ${globalUser.username} joined at \`${new Date(row.timestamp)}\`\n\n`);
                        break;
                      case "leave":
                        history.push(`📤 ${globalUser.username} left at \`${new Date(row.timestamp)}\`\n\n`);
                        break;
                    }
                    if(i == max - 1 && extra > 0){history.push(`...${extra} more`)}
                  }
                  if(!_.isEmpty(history)){
                    await msg.edit({embed: {
                          color: config.color_info,
                          author:{
                            name: `Join/Leave history for ${globalUser.username}`,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: history.join(" "),
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }else{
                    await msg.edit({embed: {
                          color: config.color_caution,
                          author:{
                            name: globalUser.username,
                            icon_url: globalUser.displayAvatarURL
                          },
                          description: `There are no join/leave records for this user`,
                          timestamp: new Date(),
                          footer: {
                            text: "Marvin's Little Brother | Current version: " + config.version
                          }
                        }
                    });
                  }
                });
              }else{return;}
            });
            //collector.on('end');
          }).catch(console.error)
        }
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "warn"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_WARN")){
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
              var data = [user, message.author.id, content, identifier, 0, new Date()];
              connection.query('INSERT INTO log_warn (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
                function(err, results){
                  if(err) throw err;

                  message.channel.send({embed: {
                        color: config.color_success,
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
                          color: config.color_caution,
                          title:`You have been warned in ${guild.name}` ,
                          description: `Details about the warning can be found below:`,
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
                              value: "This warning can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you."
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
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "cwarn"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_CWARN")){
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
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "helper"){
    if(args[0] === "clear"){
      if(message.member.roles.some(role=>["Moderators", "Support"].includes(role.name))){
        if(modulesFile.get("COMMAND_HELPER_CLEAR")){
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
                          color: config.color_success,
                          title:`[Action] Messages cleared` ,
                          description: `The latest ${deleted} message(s) written by ${user} were removed from ${channel}\n\nThis action was carried out by ${message.author}\n`,
                          timestamp: new Date(),
                          footer: {
                            text: `${identifier} | Marvin's Little Brother | Current version: ${config.version}`
                         }
                       }
                    });
                    var data = [user.id, message.author.id, channel.id, deleted, identifier, new Date()];
                    connection.query('INSERT INTO log_helperclear(userID, actioner, channel, amount, identifier, timestamp) VALUES(?,?,?,?,?,?)', data, function(err, results){
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
           syntaxErr(message, "helper_clear");
          }
        }else{
          message.channel.send(`That module (${command}) is disabled.`);
        }
      }
    }
  }

  if(command === "voicelog"){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        if(modulesFile.get("COMMAND_VOICELOG")){
          if(args[0]){
            var user = parseUserTag(args[0]);
          }else{
            syntaxErr(message, "voicelog");
            return;
          }

          if(user == "err"){
            message.channel.send("An invalid user was provided. Please try again");
          }else{
            connection.query('select * from log_voice where userID = ? ORDER BY timestamp DESC LIMIT 22', user, async function(err, rows, results){
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
        }else{
          message.channel.send(`That module (${command}) is disabled.`);
        }
      }
    }

  if(command === "disconnect"){
    if(message.member.roles.some(role=>["Admins"].includes(role.name))){
      if(modulesFile.get("COMMAND_DISCONNECT")){
        var user = parseUserTag(args[0]);
        var guildUser = guild.member(user);

        if(user !== "err" && guildUser){
          client.channels.get("333691731461537812").clone("-", false, false, `Disconnecting ${guildUser.username}`).then(async channel => {
            guildUser.setVoiceChannel(channel).then(async member => {
              await channel.delete();
              message.channel.send(`${guildUser} was successfully removed from their voice channel.`)
            }).catch(console.error)
          }).catch(console.error)
        }else{
          message.channel.send("The user provided was not found.")
        }
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "badwords"){
    if(args[0] === "add"){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        var string = (_.rest(args, 1)).join(" ");

        fs.appendFile('badWords.txt', ', '+string, (err) => {
          if (err) throw err;
          badWordList = (fs.readFileSync('badwords.txt', 'utf8').replace(/\r?\n|\r/g, "")).split(", ");
          console.log(badWordList);
          message.channel.send(`\`${string}\` added`);
        });
      }
    }
    if(args[0] === "list"){
      if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
        message.channel.send((fs.readFileSync('badwords.txt', 'utf8').replace(/\r?\n|\r/g, "")));
      }
    }
  }

  if(command === "mute"){
    if(message.member.roles.some(role=>["Moderators"].includes(role.name))){
      if(modulesFile.get("COMMAND_MUTE")){
        var user = parseUserTag(args[0]);
        var guildUser = guild.member(user);

        if(user !== "err" && guildUser){
          if(mutedFile.get(user)){
            var existingMute = mutedFile.get(user);
            message.channel.send(`${client.users.get(user)} already has an active mute. This will end at ${new Date(existingMute.end * 1000)}`);
          }else{
            var end;
            var seconds;
            var int = args[1].replace(/[a-zA-Z]$/g, "");

            if(parseInt(int)){
              switch((args[1].toLowerCase()).charAt(args[1].length - 1)){
                case "d":
                  end = ((Math.floor(Date.now() / 1000)) + (int * 24 * 60 * 60));
                  seconds = (int * 24 * 60 * 60);
                  break;
                case "h":
                  end = ((Math.floor(Date.now() / 1000)) + (int * 60 * 60));
                  seconds = (int * 60 * 60);
                  break;
                case "m":
                  end = ((Math.floor(Date.now() / 1000)) + (int * 60));
                  seconds = (int * 60);
                  break;
                default:
                  end = ((Math.floor(Date.now() / 1000)) + (int * 60 * 60));
                  seconds = (int * 60 * 60);
                  break;
              }

              var reason = _.rest(args, 2).join(" ");

              if(reason.length > 0){
                mutedFile.set(`${user}.end`, end);
                mutedFile.set(`${user}.actioner`, message.author.id);
                mutedFile.set(`${user}.actionee`, user);
                mutedFile.set(`${user}.reason`, reason);
                mutedFile.save();

                var mutedRole = guild.roles.find(val => val.name === "Muted");
                var identifier = cryptoRandomString(10);

                guild.member(user).addRole(mutedRole)
                  .then(member => {
                    message.channel.send({embed: {
                          color: config.color_success,
                          author: {
                            name: client.user.username,
                            icon_url: client.user.displayAvatarURL
                          },
                          title: "[Action] User Muted" ,
                          description: `${member} was muted by ${message.author} for ${args[1]}`,
                          fields: [{
                              name: "Reason",
                              value: reason
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
                    var data = [user, message.author.id, reason, seconds, identifier, 0, new Date()];
                    connection.query('INSERT INTO log_mutes(userID, actioner, description, length, identifier, isDeleted, timestamp) VALUES(?,?,?,?,?,?,?)', data, function(err, results){
                      if (err) throw err;
                    });

                    member.createDM().then(async chnl => {
                      await chnl.send({embed: {
                            color: config.color_caution,
                            title:`You have been muted in ${guild.name}` ,
                            description: `Details regarding the mute can be found below:`,
                            fields: [{
                                name: "Reason",
                                value: reason,
                                inline: true
                              },
                              {
                                name: "Length",
                                value: args[1],
                                inline: true
                              },
                              {
                                name: "Identifier",
                                value: `\`${identifier}\``
                              },
                              {
                                name: "Want to dispute?",
                                value: "This mute can be disputed reasonably by contacting ModMail. Please quote your identifier, which can be found above, in your initial message to us. \nThank you."
                              }
                            ],
                            timestamp: new Date(),
                            footer: {
                              text: "Marvin's Little Brother | Current version: " + config.version
                            }
                          }
                      }).then(dm => {
                        if(dm.embeds[0].type === "rich"){
                          var data = [user, dm.embeds[0].title, 3, 0, identifier, new Date(), new Date()];
                        }else{
                          var data = [user, dm.content, 3, 0, identifier, new Date(), new Date()];
                        }
                        connection.query('INSERT INTO log_outgoingdm(userid, content, type, isDeleted, identifier, timestamp, updated) VALUES(?,?,?,?,?,?,?)', data, function(err, results){if(err) throw err;})
                      });
                    }).catch(console.error);
                  }).catch(console.error)
              }else{
                message.channel.send("Please provide a reason for the mute.")
              }
            }else{
              message.channel.send(`Hm, that length doesn't seem right? ${int}`)
              return;
            }
          }
        }else{
          message.channel.send("The user provided was not found.")
        }
      }else{
        message.channel.send(`That module (${command}) is disabled.`);
      }
    }
  }

  if(command === "remindme"){
    if(message.member.roles.some(role=>["Moderators", "Support"].includes(role.name))){
      if(modulesFile.get("COMMAND_REMINDME")){
        //>remindme 1d Check that user!
        var user = message.author.id;
        var end;
        var int = args[0].replace(/[a-zA-Z]$/g, "");

        if(parseInt(int)){
          switch((args[0].toLowerCase()).charAt(args[0].length - 1)){
            case "d":
              end = ((Math.floor(Date.now() / 1000)) + (int * 24 * 60 * 60));
              seconds = (int * 24 * 60 * 60);
              break;
            case "h":
              end = ((Math.floor(Date.now() / 1000)) + (int * 60 * 60));
              seconds = (int * 60 * 60);
              break;
            case "m":
              end = ((Math.floor(Date.now() / 1000)) + (int * 60));
              seconds = (int * 60);
              break;
            default:
              end = ((Math.floor(Date.now() / 1000)) + (int * 60 * 60));
              seconds = (int * 60 * 60);
              break;
          }

          var reminder = _.rest(args, 1).join(" ");

          if(reminder.length > 0){
            reminderFile.set(`${user}${end}.who`, message.author.id)
            reminderFile.set(`${user}${end}.end`, end);
            reminderFile.set(`${user}${end}.reminder`, reminder)
            reminderFile.set(`${user}${end}.length`, args[0])
            reminderFile.save();

            message.channel.send(`I will remind you in ${args[0]} to - ${reminder}`);
          }else{
            message.channel.send("Please provide a reminder note.")
          }
      }
    }
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
  }
})

client.on('guildMemberAdd', function(member) {
  if(modulesFile.get("EVENT_GUILD_MEMBER_ADD")){
    var params = [member.user.id, member.user.username, member.user.avatar, 1, new Date(), member.user.id, member.user.id, new Date()]
    connection.query(
      `
      INSERT IGNORE INTO users (userID, username, avatar, exist, timestamp) VALUES (?,?,?,?,?);
      UPDATE users SET exist = 1 WHERE userID = ?;
      INSERT INTO log_guildjoin (userID, timestamp) VALUES (?,?);
      `, params,
      function(err, results){
        if(err) throw err;
      }
    );
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
    var userLeave = [0, member.user.id]

    connection.query(
      'INSERT INTO log_guildleave (userID, timestamp) VALUES (?,?)', data,
      function(err, results){
        if(err) throw err;
      }
    );
    connection.query(
      'UPDATE users SET exist = ? WHERE userID = ?', userLeave,
      function(err, results){
        if(err) throw err;
      }
    );
  }
})

client.on('voiceStateUpdate', function(oldMember, newMember) {
  if(modulesFile.get("EVENT_GUILD_VOICE_UPDATES")){
    var data = []
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
  }
})

client.on('userUpdate', function(oldUser, newUser) {
  if(modulesFile.get("EVENT_USER_UPDATE")){
    //Checking for username changes for logging
    	if(oldUser.username !== newUser.username){
    		var data = [newUser.id, newUser.username, oldUser.username, new Date()]
    		connection.query(
    		  'INSERT INTO log_username (userID, new, old, timestamp) VALUES (?,?,?,?)', data,
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
  }
})

client.on('guildMemberUpdate', function(oldMember, newMember) {
  if(modulesFile.get("EVENT_GUILD_MEMBER_UPDATE")){
    //Checking for nickname changes for logging
    	if(oldMember.displayName !== newMember.displayName){
    		var data = [newMember.user.id, newMember.displayName, oldMember.displayName, new Date()]
    		connection.query(
    		  'INSERT INTO log_nickname (userID, new, old, timestamp) VALUES (?,?,?,?)', data,
          function(err, results){
            if(err) throw err;
          }
    		);
    	}
  }
});

client.on('guildBanAdd', function(guild, user){
  var identifier = cryptoRandomString(10);
  bannedUsersFile.set(identifier, user.username)
  bannedUsersFile.save();

  var data = [user.id, '001', "SYSTEM BAN", identifier, 0, new Date()];
  connection.query(
    'INSERT INTO log_guildbans (userID, actioner, description, identifier, isDeleted, timestamp) VALUES (?,?,?,?,?,?)', data,
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
