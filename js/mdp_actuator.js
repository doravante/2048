function MDPActuator(learner) {
  this.path = [];

  this.learner = learner;
  this.action = undefined;

  this.totalGamesPlayed = 0;
  this.averageDiff = 0;
}

MDPActuator.prototype.actuate = function (grid, metadata) {
  if (metadata.terminated) {
    this.totalGamesPlayed++;
    this.updateReward(metadata.score);
    this.learner.learnBackwards(this.path);
  }

  this.action = this.learner.bestAction(grid.repr());

  this.updateLastState(grid);
  this.addPath(grid, this.action);
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
  //this.averageDiff = this.learner.totalDiffSum / this.path.length;
  this.averageDiff = this.learner.totalDiffSum;
  this.learner.restart();
  this.path = [];
};

module.exports = MDPActuator;
