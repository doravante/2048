var util = require("util");
var file = require("fs");
var InputManager = require('./mdp_input_manager.js');
var Actuator = require('./mdp_actuator.js');
var ScoreManager = require('./mock_score_manager.js');
var GameManager = require('./game_manager.js');

var input = new InputManager();
var actuator = new Actuator();
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
  i++;
  game.restart();
  actuator.restart();
}
