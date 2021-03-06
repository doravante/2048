var deepqlearn = require("./deepqlearn.js"),
             _ = require('underscore');

function MDPActuator() {
  var num_inputs = 16;
  var num_actions = 4;
  var temporal_window = 10;
  var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

  // the value function network computes a value of taking any of the possible actions
  // given an input state. Here we specify one explicitly the hard way
  // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
  // to just insert simple relu hidden layers.
  var layer_defs = [];
  layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
  layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
  layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
  layer_defs.push({type:'regression', num_neurons:num_actions});

  // options for the Temporal Difference learner that trains the above net
  // by backpropping the temporal difference learning rule.
  var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};

  var opt = {};
  opt.temporal_window = temporal_window;
  opt.experience_size = 30000;
  opt.start_learn_threshold = 1000;
  opt.gamma = 0.7;
  opt.learning_steps_total = 200000;
  opt.learning_steps_burnin = 3000;
  opt.epsilon_min = 0.05;
  opt.epsilon_test_time = 0.05;
  opt.layer_defs = layer_defs;
  opt.tdtrainer_options = tdtrainer_options;

  this.brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo
  
  this.restart();

  this.moves = 0;
}

MDPActuator.prototype.actuate = function (grid, metadata) {
  this.moves++;
  var state = this.convertStateToArray(grid.repr());

  // every other action but the first on every game
  if (this.action != undefined)
  {
    var reward = metadata.score - this.score;
  
    // penalize same state action
    if (reward < 0) reward = -10;

	  this.brain.backward(reward); // <-- learning magic happens here
	  this.score = metadata.score;
  }

  this.action = this.brain.forward(state);
};

MDPActuator.prototype.scaleState = function(state) {
  var min = _.min(state);		
  var max = _.max(state);
  return _(state).map(function(s) {
    return (s - min) / (max - min);
  });
}

MDPActuator.prototype.convertStateToArray = function(state) {
    return _.map(state.split('-'), function(x) { return Number(x); });
},

MDPActuator.prototype.encodeState = function(state) {
  state = this.convertStateToArray(state);
  return this.scaleState(state);
}

MDPActuator.prototype.debug = function() {
  return this.brain.average_reward_window.get_average() + " - " + this.moves;
}

MDPActuator.prototype.restart = function() {
	this.score = 0;
	this.action = undefined;
  this.moves = 0;
}

module.exports = MDPActuator;
