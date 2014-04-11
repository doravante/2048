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

var tot_games = 0;
var tot_score = 0;

while(true) {
  game.keepPlaying = true;
  while(true) {
    game.actuate();
    var action = actuator.action;
    input.move(action);
    if (game.isGameTerminated()) {
      game.actuate();
      break;
    }
  }

  tot_score += game.score;
  tot_games++;
  
  var average = tot_score / tot_games;

  if (tot_games % 10 == 0)
  {
    var contents = file.writeFileSync("./net" + tot_games + ".json", JSON.stringify(actuator.brain.value_net.toJSON()));
  }

  console.log(tot_games + ' - ' + actuator.debug());

  game.restart();
}
