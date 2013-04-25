
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    assetManager = require('connect-assetmanager'),
    less = require('less-middleware'),
    io = require('socket.io'),
    Client = require('./models/client.js').client;

var app = express();

var assetManagerGroups = {
    'js': {
        'route': /\/script\.js/,
        'path': './',
        'dataType': 'javascript',
        'files': [
          'components/jquery/jquery.min.js',
          'components/bootstrap/js/bootstrap-transition.js',
          'components/bootstrap/js/bootstrap-modal.js',
          'vendor/doodler/dist/doodler.js',
          // 'client/js/wschat.js',
          // 'client/js/chat.js',
          // 'client/js/drawing.js'
        ]
    }
};
var assetsManagerMiddleware = assetManager(assetManagerGroups);

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
app.use(assetsManagerMiddleware);
app.use(less({
  src: __dirname + '/client/css',
  dest: __dirname + '/public/',
  compress: true
}));
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
