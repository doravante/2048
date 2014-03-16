function MDPActuator(inputManager, learner) {
  this.path = [];

  this.inputManager = inputManager;
  this.learner = learner;
}

MDPActuator.prototype.actuate = function (grid, metadata) {
  if (metadata.terminated) {
    this.updateReward(metadata.score);
    this.learner.learnBackwards(this.path);
    return;
  }

  //randomize an action
  var action = this.learner.bestAction(grid.repr());

  this.updateLastState(grid);
  this.addPath(grid, action);

  this.inputManager.move(action);
};

MDPActuator.prototype.updateReward = function(reward) {
  this.path[this.path.length-1].reward = reward;
}

MDPActuator.prototype.updateLastState = function(grid) {
  if(this.path.length > 0)
    this.path[this.path.length-1].nextState = grid.repr();
}

MDPActuator.prototype.addPath = function(grid, action) {
  this.path.push({'state': grid.repr(), 'action': action, 'reward': 0, 'nextState' : grid.repr()});
}

// Continues the game (both restart and keep playing)
MDPActuator.prototype.restart = function () {
  this.path = [];
};

module.exports = MDPActuator;