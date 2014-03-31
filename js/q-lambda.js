var _ = require("underscore");

/**
  * Q(\lambda) algorithm in js.
  * A /epsilon-greedy policy iteration. The \gamma parameter controls the reward decay.
  * As we assume the state sapce is big, we are using a linear approximation.
  */
function QLambda(epsilon, lambda, gamma, alpha, actions, basis) {
  this.epsilon = epsilon;
  this.lambda = lambda;
  this.gamma = gamma;
  this.alpha = alpha;

  this.actions = actions;

  this.w = _(this.actions).times(function(){
    return _(basis).times(function(){
      return Math.random();
    });
  });

  this.currentState = undefined;
}

QLambda.prototype.start = function(initialState) {
  this.currentState = initialState;
}

QLambda.prototype.randomAction = function() {
  return ~~(Math.random() * this.actions);
}

QLambda.prototype.q_value = function(action) {
  var q = 0;

  for(i=0; i<this.w[action].length; i++) {
    q = this.w[action][i] * this.currentState[i];
  }

  return q;
}

QLambda.prototype.q_values = function() {
  var self = this;
  
  return _(this.actions).times(function(action){
    return {'action' : action, 'value' : self.q_value(action)};
  });
}

QLambda.prototype.action = function() {
  if (Math.random() < this.epsilon) {
    return this.randomAction();
  }
  
  return _.max(this.q_values(), function(obj) { return obj.value; }).action;
}

QLambda.prototype.update = function(action, newState, reward, terminal) {
  var self = this;

  terminal = terminal || false;

  var q_a = this.q_value(action);
  var delta = reward - q_a;

  this.currentState = newState;

  if (terminal) {
    this.w[action] = _.map(this.w[action], function(v) { return v + self.alpha*delta; });
  }
  else {
    q_a = _.max(this.q_values(), function(obj) { return obj.value; }).value;
    delta = delta + this.gamma*q_a;
    this.w[action] = _.map(this.w[action], function(v) { return v + self.alpha*delta; });
  }
}

module.exports = QLambda;
