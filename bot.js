const Discord = require("discord.js");
const Store = require('data-store');
const mysql = require('mysql2');
var fs = require("fs");
const editJsonFile = require("edit-json-file");
const modulesFilePath = './modules.json';
var modulesFile = editJsonFile(modulesFilePath);
var modules = require("./modules.json");
const client = new Discord.Client();
const config = require("./config.json");
const changelog = require("./changelog.json");
var guildRoles = {};

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
          isDeleted bit,
          timestamp DATETIME        NOT NULL,
          updated timestamp         NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (userID) REFERENCES users(userID),
          FOREIGN KEY (addedBy) REFERENCES users(userID)
        )
        CHARACTER SET 'utf8mb4'
        COLLATE 'utf8mb4_general_ci';`,
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
    return "err"
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
                            icon_url: client.user.avatarURL
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
                      icon_url: client.user.avatarURL
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

client.on("ready", () => {
  setupTables();
  console.log("Bot Active");

  client.user.setPresence({
    game: {
        name: 'this server',
        type: 'WATCHING'
    },
    status: 'dnd'
  })

  updateUserTable("system", null);

  //console.log(client.emojis.find(emoji => emoji.name === "question"));
});

client.on('message', async message => {
  if(message.author.bot) return; //If the author is a bot, return. Avoid bot-ception

  //Log every message that is processed, message or command.
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
                  icon_url: client.user.avatarURL
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
    }else{
      message.channel.send("Modules can only be modified by Admins")
    }
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
              icon_url: client.user.avatarURL
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
    }
  }

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

  if(command === "users"){
    if(args[0] == "count"){
      if(modulesFile.get("COMMAND_USER_COUNT")){
        connection.query(
          'SELECT COUNT(*) AS TotalUsers FROM users',
          function(err, result){
            if(err) throw err;
            if (result) message.channel.send({embed: {
                  color: 3447003,
                  author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
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
    }
    if(args[0] == "update"){
      if(modulesFile.get("COMMAND_USER_UPDATE")){
        updateUserTable("user", message.channel.id);
      }else{
        message.channel.send("That module ("+command+") is disabled");
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
                guild.ban(user, { days: 1, reason: reason }).then(result => {
                    message.channel.send({embed: {
                          color: 9911513,
                          author: {
                            name: client.user.username,
                            icon_url: client.user.avatarURL
                          },
                          title: "[Action] Ban" ,
                          description: "The user provided has been successfully banned",
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

                    var data = [result.id, result.username, result.discriminator, message.author.id, reason, null, new Date()];
                    connection.query(
                      'INSERT INTO log_guildbans (userID, username, discriminator, bannedBy, reason, note, timestamp) VALUES (?,?,?,?,?,?,?)', data,
                      function(err, results){
                        if(err) throw err;
                      }
                    );
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
      }else{
        message.channel.send("Awww, lil baby! :baby: You're too young to ban people just yet!")
      }
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
                  message.channel.send({embed: {
                        color: 9911513,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.avatarURL
                        },
                        title: "[Action] Unban (" + command + ")" ,
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

                  var data = [result.id, result.username, result.discriminator, message.author.id, reason, null, new Date()];
                  connection.query(
                    'INSERT INTO log_guildunbans (userID, username, discriminator, unbannedBy, reason, note, timestamp) VALUES (?,?,?,?,?,?,?)', data,
                    function(err, results){
                      if(err) throw err;
                    }
                  );
                })
              .catch(err => {
                if(err.message === "Unknown Ban"){
                  message.channel.send("That user doesn't appear to be banned");
                  console.log(err);
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
        message.channel.send("Awww, lil baby! :baby: You're too young to unban people just yet!")
      }
    }else{
      message.channel.send("That module ("+command+") is disabled");
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
            var reason = tail.join(" ").trim();

            if(tail.length > 0){
              var data = [user, message.author.id, reason, 0, new Date(), new Date()];
              connection.query(
                'INSERT INTO log_note (userID, addedBy, note, isDeleted, timestamp, updated) VALUES (?,?,?,?,?,?)', data,
                function(err, results){
                  if(err) throw err;
                }
              );
            }else{
              message.channel.send("The note needs a reason!");
            }
          }else{
            message.channel.send("The user provided was not found in this guild");
          }
        }
      }
    }else{
      message.channel.send("That module ("+command+") is disabled");
    }
  }

  if(command === "user"){
    message.channel.send({embed: {
          color: 14499301,
          title: "A react collector was made",
          timestamp: new Date(),
          footer: {
            text: "Marvin's Little Brother | Current version: " + config.version
          }
        }
    }).then(collectme => {
      console.log(config.ownerid);
      collectme.react("318081582579712000");

      const filter = (reaction, user) => reaction.emoji.id === '318081582579712000' && user.id === config.ownerid;
      const collector = collectme.createReactionCollector(filter, { time: 15000 });

      collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
      collector.on('end', collected => console.log(`Collected ${collected.size} items`));

    }).catch(console.error)
  }
});

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
    if(oldMember.voiceChannel){
      if(newMember.voiceChannel && newMember.voiceChannel.id !== oldMember.voiceChannel.id){
        data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, oldMember.voiceChannel.id, oldMember.voiceChannel.name, 2, new Date()]
      }else{
        data = [newMember.id, '', '', oldMember.voiceChannel.id, oldMember.voiceChannel.name, 3, new Date()]
      }
    }else{
      if(newMember.voiceChannel){
        data = [newMember.id, newMember.voiceChannel.id, newMember.voiceChannel.name, '', '', 1, new Date()]
      }else{
        data = [newMember.id, 'UNKNOWN', newMember.voiceChannel.name, '', '', 1, new Date()]
      }
    }
    connection.query(
      'INSERT INTO log_voice (userID, newChannelID, newChannel, oldChannelID, oldChannel, type, timestamp ) VALUES (?,?,?,?,?,?,?)', data,
      function(err, results){
        if(err) throw err;
      }
    );
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

client.on('error', console.error);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

client.login(config.token);
