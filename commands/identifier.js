exports.run = (client, message, args) => {
    const modulesFile = client.modulesFile;
    const connection = client.connection;
    const functionsFile = client.functionsFile;
    const config = client.config;
    const guild = message.guild;
    if (message.member.roles.some(role => ['Moderators'].includes(role.name))) {
      if (modulesFile.get('COMMAND_IDENTIFIER')) {
        if(args[0] && args[0].length == 10){
          var id = args[0];
              connection.query('CALL identifier_locate(?, @where)', id,
              function (err, rows, result) {
                  if (err) throw err;
                  if (rows[0].length > 0) {
                    switch(rows[0][0].type){
                      case "warn":
                        connection.query('select * from log_warn where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_caution,
                                          title: `Warning for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` ❗ Warning by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "note":
                        connection.query('select * from log_note where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_caution,
                                          title: `Note for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` 📌 Note by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "ban":
                        connection.query('select * from log_guildbans where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_warning,
                                          title: `Ban for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` ⚔ Banned by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "unban":
                        connection.query('select * from log_guildunbans where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_success,
                                          title: `Unban for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` 🛡 Unbanned by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "mute":
                        connection.query('select * from log_mutes where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_caution,
                                          title: `Mute for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` 🔇 Mute by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} for ${rows[0].length}s \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "unmute":
                        connection.query('select * from log_unmutes where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    message.channel.send({
                                      embed: {
                                          color: config.color_success,
                                          title: `Unmute for ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` Unmute by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} \n \`\`\`${rows[0].description}\`\`\`\n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                      case "clear":
                        connection.query('select * from log_helperclear where identifier = ?', id,
                            function (err, rows, result) {
                                if (err) throw err;
                                if (rows) {
                                  client.fetchUser(rows[0].userID).then(u => {
                                    var channel = guild.channels.find(chnl => chnl.id === rows[0].channel);
                                    message.channel.send({
                                      embed: {
                                          color: config.color_success,
                                          title: `Helper clear on ${u.username} (${u.id})`,
                                          description: `\`${rows[0].identifier}\` ${rows[0].amount} messages cleared by ${client.users.get(rows[0].actioner)} on ${rows[0].timestamp.toUTCString()} from ${channel} \n`,
                                          timestamp: new Date(),
                                          footer: {
                                              text: `Marvin's Little Brother | Current version: ${config.version}`
                                          }
                                      }
                                    }).catch(console.error);
                                  });
                                }
                            }
                        );
                      break;
                    }
                  }else{
                    message.channel.send(":x: That identifier couldn't be found. Please review and try again.");
                  }
              }
          );
        }else{
          message.channel.send(":x: That identifier doesn't look right. Try again.")
        }
      }
    }
}
