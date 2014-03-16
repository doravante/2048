function Action(action){
  this.action = action;
  this.value = 0;
  this.visits = 0;
}

Action.prototype.alpha = function (action){
  return 1 / (1.0 + this.visits++);
};

function State(){
  this.actions = {'0' : new Action(0), '1' : new Action(1), '2' : new Action(2), '3' : new Action(3)};
}

State.prototype.get = function(action){
  return this.actions[action];
}

State.prototype.bestAction = function(){
  var best = this.actions[0];
  for (var action in this.actions) {
    if (this.get(action).value > best.value) best = this.get(action);
  }

  return best;
}

State.prototype.visits = function(){
  var visits = 0;
  for (var action in this.actions) {
    visits += this.get(action).visits;
  }

  return visits;
}

function QLearner(gamma){
    this.gamma = gamma || 0.8;
    this.q = {};
}

QLearner.prototype.learnBackwards = function(steps){
  var self = this;

  steps.forEach(function(step){
    self.updateQ(step.state, step.action, step.reward, step.nextState); 
  });
}

QLearner.prototype.updateQ = function(from, action, reward, to){
  if(!this.q[from]) this.addState(from);
  if(!this.q[to]) this.addState(to);
  var alpha = this.q[from].get(action).alpha();
  this.q[from].get(action).value = (1 - alpha)*this.q[from].get(action).value + alpha*(reward + this.gamma*this.q[to].bestAction().value);
}

QLearner.prototype.addState = function(state){
  this.q[state] = new State();
}

QLearner.prototype.bestAction = function(state){
  var state = this.q[state];
  if (state && state.visits() > 5000) {
    return state.bestAction().action;
  } else {
    return this.randomAction();
  }
};

QLearner.prototype.randomAction = function() {
  return ~~(Math.random() * 4);
}

module.exports = QLearner;
