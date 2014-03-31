var fourier = require("./fourier_basis.js");
var learner = require("./q-lambda.js");

function MDPActuator() {
  this.fourier = new fourier(3, 16);

  this.learner = new learner(0.1, 1.0, 0.9, 0.001, 4, this.fourier.nterms);
  this.action = undefined;

  this.totalGamesPlayed = 0;
  this.averageDiff = 0;
}

MDPActuator.prototype.actuate = function (grid, metadata) {
  var state = this.fourier.encodeState(grid.repr());

  if (metadata.terminated) {
    this.totalGamesPlayed++;
    this.learner.update(this.action, state, metadata.score, true);
    return;
  }

  if (this.action != undefined) {
    this.learner.update(this.action, state, 0, false);
  }
  else {
    this.learner.start(state);
  }

  this.action = this.learner.action();
};

MDPActuator.prototype.restart = function() {
  this.action = undefined;
}

module.exports = MDPActuator;
