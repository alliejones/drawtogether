function Client (ws) {
  this.socket = ws;
  this.id = ws.id;
  this.username = 'Anonymous';
}

Client.prototype.logout = function () {
  this.emit('user:logout', { content: null, user: this.toJSON() });
};

Client.prototype.onConnection = function () {};

Client.prototype.onLogin = function (username) {
  this.username = username;
  this.emit('user:login', { content: null, user: this.toJSON() });
};

Client.prototype.onMessage = function (data) {
  this.emit('user:message', {
    content: data,
    user: this.toJSON()
  });
};

Client.prototype.onDrawing = function (data) {
  this.emit('user:drawing', {
    content: data,
    user: this.toJSON()
  }, false);
};

Client.prototype.onDisconnect = function () {
  this.logout();
};

Client.prototype.toJSON = function () {
  return { id: this.id, username: this.username };
}

Client.prototype.emit = function(type, args, includeSelf) {
  includeSelf = (typeof includeSelf === 'undefined') ? true : includeSelf;
  if (includeSelf) {
    this.socket.manager.sockets.in('').emit(type, args);
  } else {
    this.socket.broadcast.emit(type, args);
  }
};

exports.client = Client;