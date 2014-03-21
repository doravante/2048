var util = require("util");
var file = require("fs");
var InputManager = require('./mdp_input_manager.js');
var Actuator = require('./mdp_actuator.js');
var ScoreManager = require('./mock_score_manager.js');
var GameManager = require('./game_manager.js');

var QLearner = require('./q-learning.js');

var learner = new QLearner(0.9);
var input = new InputManager();
var actuator = new Actuator(learner);
var score = new ScoreManager();

var game = new GameManager(4, input, actuator, score);

var i=0;

while(true) {
  while(true) {
    game.actuate();
    var action = actuator.action;
    input.move(action);
    if (game.isGameTerminated()) {
      game.actuate();
      break;
    }
  }

  console.log(i + ' - ' + game.score + ' - ' + score.get() + ' - ' + actuator.averageDiff);
  if (i % 1000 == 0) {
    var contents = file.writeFileSync("./qvalues" + i + ".json", util.inspect(learner.toJSON(), true, depth=7) + " - " + game.score);
  }
  i++;
  game.restart();
}
