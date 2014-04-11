// paste all from build
// paste best json in net variable
// paste this

function Game() {
  this.element = tiles = 'tile-container';

  this.actions = {};
  this.actions[0] = 87; //keycode w
  this.actions[1] = 68; //keycode d
  this.actions[2] = 83; //keycode s
  this.actions[3] = 65; //keycode a
}

Game.prototype.currentState = function() {
  var state = new Array(16);
  for (i=0; i<16; i++) {
    state[i] = 0;
  }

  var tiles = document.getElementsByClassName(this.element)[0].children;
  for (i=0; i<tiles.length; i++) { 
    var tile = tiles[i];
    var number = Number(tile.textContent);
    var positions = tile.getAttribute('class').split(' ').reduce(function(a,b) { return a.split('-').length == 4 ? a : b }).split('-').slice(2,4);
    var position = Number(positions[0])-1 + (Number(positions[1])-1)*4;
    state[position] = number;
  }

  return state;
}

Game.prototype.sameState = function(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

Game.prototype.reward = function() {
  return eval(document.getElementsByClassName('score-container')[0].textContent);
}

Game.prototype.randomAction = function() {
  return ~~(Math.random() * 4);
}

Game.prototype.__triggerKeyboardEvent = function(el, keyCode)
{
  var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");
  
  if(eventObj.initEvent){
    eventObj.initEvent("keydown", true, true);
  }
  
  eventObj.keyCode = keyCode;
  eventObj.which = keyCode;
    
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj); 
} 

Game.prototype.act = function(action) {
  var body = document.getElementsByTagName('body')[0];
  this.__triggerKeyboardEvent(body, this.actions[action]);
}

Game.prototype.hasEnded = function() {
  return document.getElementsByClassName('game-over').length > 0;
}

Game.prototype.restartGame = function() {
  document.getElementsByClassName('retry-button')[0].click();
}

var game = new Game();

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

var brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo

brain.value_net.fromJSON(net);
brain.learning = false;

var sid = setInterval(step, 500);

function slow(){
    clearInterval(sid);
    sid = setInterval(step, 500);
}

function fast(){
    clearInterval(sid);
    sid = setInterval(step, 20);
}

function stop() {
    clearInterval(sid);
}

function step(){
    //memorize current state
    var state = game.currentState();
   
    //get some action
    var action = brain.forward(state);

    console.log("Ação desejada: " + action);
    
    //apply the action
    game.act(action);
}
