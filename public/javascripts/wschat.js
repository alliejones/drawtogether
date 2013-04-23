(function(scope) {
  function WSChat (url) {
    this.client = null;
    this.url = url;
    return this;
  };

  WSChat.prototype.login = function (username) {
    this.client = new io.connect(this.url, { reconnect: false });
    this.client.emit('login', username);
    return this;
  };

  WSChat.prototype.send = function (message) {
    if (this.client !== null) {
      this.client.emit('message', message);
    }
  };

  WSChat.prototype.logout = function () {
    if (this.client !== null) {
      this.client.socket.disconnect();
    }
  };

  WSChat.prototype.on = function () {
    this.client.on.apply(this.client, arguments);
  };

  WSChat.prototype.off = function () {};

  scope.WSChat = WSChat;
})(this);

