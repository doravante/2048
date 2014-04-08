var learner = require("./q-lambda.js");

function MDPActuator() {
  this.learner = new learner(0.1, 1.0, 0.9, 4);
  this.setup();
}

MDPActuator.prototype.setup = function () {
  this.state = undefined;
  this.action = undefined;
}

MDPActuator.prototype.actuate = function (grid, metadata) {
  var state = grid.repr();

  if (metadata.terminated) {
    this.learner.update(this.action, metadata.score, undefined);
    
    this.setup();
    return;
  }

  var action = this.learner.nextMove(state);
  
  if (this.action != undefined) {
    this.learner.update(this.action, 0, state);
  }
  else {
    this.learner.start();
  }

  this.state = state;
  this.action = action;
};

MDPActuator.prototype.restart = function() {
}


module.exports = MDPActuator;
