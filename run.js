var irc = require('./lib/irc'),
    api = irc.api,
    elbot = require('./lib/elbot');

var sys = require('sys');

elbot.init(function() {
  api.addListener("pm", function(client, message, nick) {
    elbot.say(message, function(msg) {
      irc.sendPM(client, nick, msg);
    });
  });

  api.addListener("message", function(client, message, channel, nick) {
    var pos = message.indexOf(client.nick);
    if (0 === pos) {
      message = message.slice(client.nick.length).replace(/^\s*(:|,|>)\s*/, '');
      if (0 < message.length) {
        sys.puts(message);
        elbot.say(message, function(msg) {
          irc.sendMessage(client, channel, msg, nick);
        });
      }
    }
  });
});

