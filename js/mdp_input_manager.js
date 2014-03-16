function MDPInputManager() {
  this.events = {};
}

MDPInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

MDPInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

MDPInputManager.prototype.move = function (action) {
  this.emit("move", action);
};

MDPInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

MDPInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

module.exports = MDPInputManager;
