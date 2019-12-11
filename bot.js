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

const mysql = require('mysql2');
const moment = require('moment');
const client = new Discord.Client();
const _ = require('underscore');
const config = require('./config.json');
const editJsonFile = require('edit-json-file');
const stringSimilarity = require('string-similarity');
const cryptoRandomString = require('crypto-random-string');
const enmap = require('enmap');
const fs = require(`fs`);
const request = require('request');

const functionsFile = require(`./functions.js`);
const channelsFile = editJsonFile('./channels.json');
const modulesFile = editJsonFile('./modules.json');
const bannedUsersFile = editJsonFile('./banned_users.json');
const badWordsFile = editJsonFile(`./bad_words.json`);
const mutedFile = editJsonFile('./muted.json');
const reminderFile = editJsonFile('./reminders.json');
const usercardsFile = editJsonFile('./usercards.json');
const customCommands = editJsonFile('./customCommands.json');
const LFGRoomsFile = editJsonFile('./LFGRooms.json');
const reactionsFile = editJsonFile('./reactions.json');

console.log(`[${new Date().toUTCString()}] Initializing...`);

const connection = mysql.createConnection({
    host: config.host,
    port: config.port,
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
client.moment = moment;
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
client.cryptoRandomString = cryptoRandomString;
client.reactionsFile = reactionsFile;
client.channelsFile = channelsFile;
client.live = false;

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
