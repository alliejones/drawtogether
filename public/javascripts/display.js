;(function(scope) {
  var users = [];
  var $userList = $('.users .wrapper');
  var $modal = $('#modal');
  scope.$chatLog = $('.chat-log .wrapper');
  var wsChat = new WSChat('ws://'+window.location.host);

  $(function() {
    // close socket connection when the page is reloaded or closed
    $(window).on('beforeunload', function() { wsChat.logout(); });

    // $modal.on('shown', function() { $('input[name="username"]').focus(); });
    // $modal.modal('show');
    wsChat.login('allie');
    attachListeners();

    $('.action-login').click(logIn);
    $('.action-send').click(sendMessage);
  });

  function attachListeners() {
    wsChat.on('server:connection', addUsers);
    wsChat.on('local:logout', logout);
    wsChat.on('user:message', displayUserMessage);
    wsChat.on('user:login', displayLoginMessage);
    wsChat.on('user:logout', displayLogoutMessage);
    wsChat.on('user:login', addUser);
    wsChat.on('user:logout', removeUser);
  }

  function logIn(e) {
    var username = $('input[name="username"]').val();
    if (username !== '') {
      $modal.modal('hide');
      wsChat.login(username);
      attachListeners();
    }
  }

  function sendMessage(e) {
    var textarea = $('textarea[name="message"]');
    var message = textarea.val();
    wsChat.send($('<div/>').text(message).html()); // escape html
    textarea.val('').focus();
    e.preventDefault();
  }

  function displayUserMessage(msg) {
    var content = msg.content.replace(/\n/g, '<br>');
    $chatLog.append('<p><strong>'+msg.user.username+':</strong> '+content+'</p>');
    adjustLogPosition();
  }

  function adjustLogPosition() {
    var $parent = $chatLog.parent();
    $parent.scrollTop($chatLog.height() - $parent.height());
  }

  function displayLoginMessage(msg) {
    $chatLog.append('<p class="system">'+msg.user.username+' has logged in.</p>');
  }

  function displayLogoutMessage(msg) {
    $chatLog.append('<p class="system">'+msg.user.username+' has logged out.</p>');
  }

  function addUsers(msg) {
    $.each(msg, function (key, obj) {
      users.push(obj);
    });
    renderUsers();
  }

  function addUser(msg) {
    users.push(msg.user);
    renderUsers();
  }

  function removeUser(msg) {
    if (msg.user && msg.user.id) {
      var removeID = msg.user.id;
      for (var i = 0, len = users.length; i < len; i++) {
        if (users[i].id === removeID) {
          users.splice(i, 1);
          break;
        }
      }
      renderUsers();
    }
  }

  function renderUsers() {
    var html = '';
    $userList.empty();
    $.each(users, function() {
      html += "\n<li class='user-"+this.id+"'>"+this.username+"</li>";
    });
    $userList.append(html);
  }

  function logout() {
    wsChat.emit('local:logout');
    $userList.empty();
  }
})(this);
