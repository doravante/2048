var _ = require("underscore");
var brain = require('./neuralnetwork.js');

function QLearner(gamma){
  this.gamma = gamma || 0.8;
  this.q = {};

  this.hiddenLayers = [20];

  this.net = new brain.NeuralNetwork({hiddenLayers: this.hiddenLayers});
  this.net.initialize(_([17, this.hiddenLayers, 1]).flatten());
}

QLearner.prototype.learnBackwards = function(steps){
  var self = this;

  steps.reverse();
  for(i=0; i<steps.length; i++) {
    var previous = i - 1;
    if (previous < 0) continue;

    var previousReward = steps[previous].reward;
    steps[i].reward = previousReward * this.gamma;
  }

  steps.forEach(function(step){
    self.updateQ(step.state, step.action, step.reward, step.nextState); 
  });
}

QLearner.prototype.updateQ = function(from, action, reward, to){
  var input = this.encodeInput(from, action);
  this.net.trainPattern(input, [reward]);
}

QLearner.prototype.encodeInput = function(state, action) {
  var stateArray = _.map(state.split('-'), function(x) { return Number(x); });
  return _([stateArray, action]).flatten()
}

QLearner.prototype.bestAction = function(state){
  var self = this;

  var actions = _.map([0,1,2,3], function(x) { var input = self.encodeInput(state, x); return {reward: self.net.run(input), action: x}; });
  var bestAction = _.max(actions, function(pair) { return pair.reward; });

  var diffSum = 0;
  _.each(actions, function(action) { var diff = Math.abs(action.reward - bestAction.reward); diffSum += diff; });

  if (diffSum < 0.5)
    return this.randomAction();
  else
    return bestAction.action;
};

QLearner.prototype.randomAction = function() {
  return ~~(Math.random() * 4);
}

QLearner.prototype.toJSON = function() {
  return this.net.toJSON();
}

module.exports = QLearner;
