var _ = require("underscore");
var fourier = require("./fourier_basis.js");

/**
  * Q(\lambda) algorithm in js.
  * A /epsilon-greedy policy iteration. The \gamma parameter controls the reward decay.
  * As we assume the state sapce is big, we are using a linear approximation.
  */
function QLambda(epsilon, lambda, gamma, actions) {
  this.epsilon = epsilon;
  this.lambda = lambda;
  this.gamma = gamma;

  this.actions = actions;

  this.fa = _(actions).times(function(){
    return new fourier(3, 16);
  });

  this.currentState = undefined;
}

QLambda.prototype.start = function() {
  var nterms = this.fa[0].nterms;
	
  this.trace = _(this.actions).times(function(){
    return _(nterms).times(function(){
      return 0;
    });
  });

  this.currentState = undefined;
}

QLambda.prototype.randomAction = function() {
  return ~~(Math.random() * this.actions);
}

QLambda.prototype.nextMove = function(state) {
  this.currentState = state;

  if (Math.random() < this.epsilon) {
    return this.randomAction();
  }
  
  var qValues = _(this.fa).map(function(f, action){
    return {'action' : action, 'q' : f.valueAt(state) };
  });
  
  var maxQ = _.max(qValues, function(obj) { return obj.q; }).q;  
  return _.sample(_(qValues).filter(function(obj) { return obj.q == maxQ})).action;
}

QLambda.prototype.update = function(action, reward, newState) {
  var self = this;

  terminal = newState === undefined;

  var q_a = self.fa[action].valueAt(this.currentState);
  var delta = reward - q_a;

  //update traces
  var features = self.fa[action].encodeState(this.currentState);
  this.trace[action] = (self.trace[action]).map(function(x,i){
	 return  x + (features[i] > 0 ? 1 : 0);
  });

  _(self.fa).map(function(f, action){
	  var w_deltas = _(self.trace[action]).map(function(x){
		 return x * self.gamma * delta; 
	  });
	  
	  f.updateWeights(w_deltas);
  });

  if (terminal) {
    var w_deltas = _(self.trace[action]).map(function(x){
		 return x * delta; 
	  });

    this.fa[action].updateWeights(w_deltas);
    return;
  }

  q_a = self.fa[action].valueAt(newState);
  delta = delta + this.gamma*q_a;
  var w_deltas = _(self.trace[action]).map(function(x){
	 return x * delta; 
  });
  this.fa[action].updateWeights(w_deltas);

  //decay traces
  self.trace = _(self.trace).map(function(trace){
   return _(trace).map(function(x){
	  return x * self.gamma * self.lambda; 
   }); 
  });

  this.currentState = newState;
}

module.exports = QLambda;
