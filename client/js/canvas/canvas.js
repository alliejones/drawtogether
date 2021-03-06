function Canvas (settings) {
  this.el = document.createElement('canvas');
  this.ctr = document.getElementById(settings.id);
  this.ctx = this.el.getContext('2d');
  this.ctr.appendChild(this.el);

  this.prevMouseCoords = { x: null, y: null };
  this.mouseCoords = { x: null, y: null };
  this.curMouseCoords = { x: null, y: null };
  this._dragging = false;

  this.el.width = settings.width;
  this.el.height = settings.height;

  this.ctx.lineCap = 'round';
  this.ctx.lineJoin = 'round';
  this.ctx.strokeStyle = 'black';

  this.localQueue = null;
  this.queues = {};

  this.cmds = [];
  this.colors = {};
  this.widths = {};

  if (!settings.readOnly) {
    this.ctr.addEventListener('mousedown', this._onMousedown.bind(this));
    // fix canvas cursor in Chrome
    window.addEventListener('selectstart', function() { return false; });
    window.addEventListener('mousemove', this._onMousemove.bind(this));
    window.addEventListener('mouseup', this._onMouseup.bind(this));
    window.addEventListener('scroll', this._updateOffset.bind(this));
  }

  this._updateOffset();
  this.nextTick();
}

Canvas.prototype.registerQueue = function (id, queue) {
    this.queues[id] = queue;
};

Canvas.prototype.nextTick = function () {
  requestAnimationFrame(this.nextTick.bind(this));
  for (var id in this.queues) {
    var queue = this.queues[id];
    if (!queue.isEmpty()) {
      this.processCommand(queue.dequeue(), queue.user);
    }
  }
};

Canvas.prototype.processCommand = function (cmdString, user) {
  user = user || this.localQueue.user;
  var data = cmdString.toString().split(',');
  if (data.length === 4) {
    // this is a line, draw it
    this._setStrokeColor(user.strokeColor);
    this._setStrokeWidth(user.strokeWidth);
    this._line.apply(this, data);
  } else {
    // a single number represents a command
    var cmd = this.cmds[data[0]].slice(0);
    var func = cmd.shift();
    this['_'+func].apply(this, cmd);
    user[func].apply(user, cmd);
  }
};

// map coordinates from window to canvas
Canvas.prototype._mapCoords = function (x, y) {
  var boundingBox = this.el.getBoundingClientRect();

  return {
    x: x - boundingBox.left * (this.el.width / boundingBox.width),
    y: y - boundingBox.top * (this.el.height / boundingBox.height)
  };
};

Canvas.prototype._onMousedown = function (e) {
  this._dragging = true;
  this._startDrawing(e);
};
Canvas.prototype._onMouseup = function () {
  this._dragging = false;
};

Canvas.prototype._onMousemove = function(e) {
  this.curMouseCoords = this._mapCoords(e.pageX - this._offset.left, e.pageY - this._offset.top);
  // console.log(this.curMouseCoords);
};

Canvas.prototype._updateOffset = function () {
  this._offset = this._windowScrollPosition();
};

Canvas.prototype._windowScrollPosition = function() {
  var doc = document.documentElement;
  var body = document.body;
  var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
  var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
  return { left: left, top: top };
};

Canvas.prototype._startDrawing = function (e) {
  var coords = this._mapCoords(e.pageX, e.pageY);
  this.ctx.moveTo(coords.x, coords.y);
  this.ctx.beginPath();
  this._draw();
};

Canvas.prototype._stopDrawing = function () {
  this.ctx.beginPath();
  this.prevMouseCoords = { x: null, y: null };
  this.mouseCoords = { x: null, y: null };
};

Canvas.prototype._draw = function() {
  if (this._dragging) {
    requestAnimationFrame(this._draw.bind(this));
  }

  var x1 = this.prevMouseCoords.x = this.mouseCoords.x;
  var y1 = this.prevMouseCoords.y = this.mouseCoords.y;
  var x2 = this.mouseCoords.x = this.curMouseCoords.x;
  var y2 = this.mouseCoords.y = this.curMouseCoords.y;
  if (x1 === null || y1 === null) {
    x1 = x2;
    y1 = y2;
  }
  console.log(x1, y1, x2, y2);
  this.line(x1, y1, x2, y2);

  if (!this._dragging) {
    this._stopDrawing();
  }
};

Canvas.prototype.setStrokeColor = function (color) {
  this.localQueue.queue(this.colors[color]);
};

Canvas.prototype._setStrokeColor = function (color, user) {
  this.ctx.strokeStyle = color;
};

Canvas.prototype.registerStrokeColor = function(color) {
  if (!this.colors.hasOwnProperty(color)) {
    this.cmds.push([ 'setStrokeColor', color ]);
    // save the cmd index so it can be looked up by color
    this.colors[color] = this.cmds.length - 1;
  }
};

Canvas.prototype.setStrokeWidth = function (width) {
  this.localQueue.queue(this.widths[width]);
};

Canvas.prototype._setStrokeWidth = function (width, user) {
  this.ctx.lineWidth = width;
};

Canvas.prototype.registerStrokeWidth = function(width) {
  if (!this.widths.hasOwnProperty(width)) {
    this.cmds.push([ 'setStrokeWidth', width ]);
    // save the cmd index so it can be looked up by width
    this.widths[width] = this.cmds.length - 1;
  }
};

Canvas.prototype.line = function (x1, y1, x2, y2) {
  this.localQueue.queue([ Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2) ].join(','));
};

Canvas.prototype._line = function (x1, y1, x2, y2) {
  this.ctx.beginPath();
  this.ctx.moveTo(x1, y1);
  this.ctx.lineTo(x2, y2);
  this.ctx.stroke();
};

Canvas.prototype.translate = function (x, y) {
  this.ctx.save();
  this.ctx.translate(x, y);
};

Canvas.prototype.undoTranslate = function () {
  this.ctx.restore();
};

Canvas.prototype.erase = function () {
  this.ctx.clearRect(0, 0, this.el.width, this.el.height);
};

Canvas.prototype.fromString = function (data) {
  this.localQueue.fromString(data);
};
