;(function(scope) {
  function WSChat (url) {
    this.user = null;
    this.users = {};
    this.conn = null;
    this.url = url;
    return this;
  };

  function User (user) {
    this.id = user.id;
    this.username = user.username;
    this.queue = new Queue(this.id);
    this.conn = null;
  }

  WSChat.prototype.login = function (username) {
    this.conn = new io.connect(this.url, { reconnect: false });
    this.conn.on('connect', function () {
      this.user = new User({ id: this.conn.socket.sessionid, username: username });
      this.user.queue.local = true;
      canvas.registerQueue(this.user.id, this.user.queue);
      canvas.localQueue = this.user.queue;
      this.conn.emit('login', username);
    }.bind(this));
    return this;
  };

  WSChat.prototype.send = function (message, type) {
    type = type || 'message';
    if (this.conn !== null) {
      this.conn.emit(type, message);
    }
  };

  WSChat.prototype.logout = function () {
    if (this.conn !== null) {
      this.conn.socket.disconnect();
    }
  };

  WSChat.prototype.addUser = function (userInfo) {
    if (userInfo.id !== this.user.id) {
      var user = new User(userInfo);
      this.users[user.id] = user;
      canvas.registerQueue(user.id, user.queue);
    }
  }

  WSChat.prototype.on = function () {
    this.conn.on.apply(this.conn, arguments);
  };

  WSChat.prototype.off = function () {};

  scope.WSChat = WSChat;
})(this);

