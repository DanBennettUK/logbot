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
const enmap = require('enmap');
const fs = require(`fs`);
const request = require('request');

const functionsFile = require(`./functions.js`);
var modulesFile = editJsonFile('./modules.json');
var bannedUsers = require('./banned_users.json');
var bannedUsersFile = editJsonFile('./banned_users.json');
var badWordsFile = editJsonFile(`./bad_words.json`);
var mutedFile = editJsonFile('./muted.json');
var reminderFile = editJsonFile('./reminders.json');
var usercardsFile = editJsonFile('./usercards.json');
var customCommands = editJsonFile('./customCommands.json');
var LFGRoomsFile = editJsonFile('./LFGRooms.json');

console.log(`[${new Date().toUTCString()}] Initializing...`);

const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: config.multipleStatements
});
connection.connect(function (err, results) {
    console.log(`[${new Date().toUTCString()}] Successfully connected to database.`);
    if (err) throw err;
});

client.commands = new enmap();
client.Discord = Discord;
client.underscore = _;
client.connection = connection;
client.moment = moment; //why
client.mysql = mysql;
client.config = config;
client.editJsonFile = editJsonFile;
client.stringSimilarity = stringSimilarity;
client.modulesFile = modulesFile;
client.bannedUsersFile = bannedUsersFile;
client.badWordsFile = badWordsFile;
client.mutedFile = mutedFile;
client.reminderFile = reminderFile;
client.usercardsFile = usercardsFile;
client.customCommands = customCommands;
client.LFGRoomsFile = LFGRoomsFile;
client.connection = connection;
client.functionsFile = functionsFile;
client.request = request;

fs.readdir(`./events/`, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      if (!file.endsWith(`.js`)) return;
      const event = require(`./events/${file}`);
      const eventName = file.split(`.`)[0];
      console.log(`[${new Date().toUTCString()}] Attempting to load /events/${eventName}.js...`);
      client.on(eventName, event.bind(null, client));
      console.log(`[${new Date().toUTCString()}] Loaded /events/${eventName}.js!`);
    });
  });

  fs.readdir(`./commands/`, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      if (!file.endsWith(`.js`)) return;
      const props = require(`./commands/${file}`);
      const commandName = file.split(`.`)[0];
      console.log(`[${new Date().toUTCString()}] Attempting to load /commands/${commandName}.js...`);
      client.commands.set(commandName, props);
      console.log(`[${new Date().toUTCString()}] Loaded /commands/${commandName}.js!`);
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
