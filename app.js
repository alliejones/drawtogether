
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    Client = require('./models/client.js').client;

var app = express();

var clients = {};

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = io.listen(server);
if (app.get('env') !== 'development') { io.set('log level', 1); }

io.sockets.on('connection', function (socket) {
  var client = new Client(socket);
  client.onConnection();
  client.socket.emit('server:connection', clients);
  clients[client.id] = client;

  socket.on('login', function (username) {
    client.onLogin(username);
  });

  socket.on('message', function (data) {
    client.onMessage(data);
  });

  socket.on('drawing', function (data) {
    client.onDrawing(data);
  });

  socket.on('disconnect', function () {
    client.onDisconnect();
    delete clients[client.id];
  });
});
