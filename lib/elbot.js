var http = require('http'),
    qs = require('querystring');

var client = http.createClient(80, 'www.elbot.com'),
    stack = [],
    busy = false,
    headers = {
      'Host': 'www.elbot.com',
      'Cookie': 'cookie_howdyouhear_asked=true',
      'User-Agent': 'node-elbot'
    },
    secret = {
      'IDENT': '',
      'USERLOGID': '',
      'EXTRAINPUT': ''
    };


var say = exports.say = function say() {
  stack.push(arguments);
  updateStack();
};

var updateStack = function updateStack() {
  if (true === busy || 0 >= stack.length) {
    return;
  }

  busy = true;
  var item = stack.shift();
  send.apply(null, item);
};

var send = function send(msg, callback) {
  var body, request;
  body = qs.stringify(secret) + '&ENTRY=' + encodeURIComponent(msg);

  request = client.request('POST', '/cgi-bin/elbot.cgi', {
    'Host': headers['Host'],
    'Content-Length': body.length,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': headers['User-Agent'],
    'Cookie': headers['Cookie']
  });

  request.addListener('response', function(response) {
    var body = '';
    response.setBodyEncoding('utf8');
    response.addListener('data', function(chunk) {
      body = body + chunk;
    });
    response.addListener('end', function() {
      body = parseResponse(body);
      callback(body);
      busy = false;
      updateStack();
    });
  });

  request.write(body);
  request.close();
};

var parseResponse = function parseResponse(input) {
  input = input.replace(/\s+/g, ' ');
  try {
    secret['IDENT'] = /name="IDENT" value="(.+?)"/.exec(input)[1];
    secret['USERLOGID'] = /name="USERLOGID" value="(.+?)"/.exec(input)[1];
    secret['EXTRAINPUT'] = /name="EXTRAINPUT" value="(\d+?)"/.exec(input)[1];
    return input.split('<!-- Begin Response !-->')[1].split('<!-- End Response')[0].
                 replace(/<!?--.*?--!?>/g, '').trim();
  } catch (error) {
    return 'Bad response.';
  }
};

exports.init = function init(callback) {
  var request;

  request = client.request('GET', '/cgi-bin/elbot.cgi?START=normal', {
    'Host': headers['Host'],
    'User-Agent': headers['User-Agent']
  });

  request.addListener('response', function(response) {
    var body = '';
    response.setBodyEncoding('utf8');
    response.addListener('data', function(chunk) {
      body = body + chunk;
    });
    response.addListener('end', function() {
      parseResponse(body);
      callback();
    });
  });

  request.close();
};
