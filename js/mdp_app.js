var file = require("fs");
var InputManager = require('./mdp_input_manager.js');
var Actuator = require('./mdp_actuator.js');
var ScoreManager = require('./mock_score_manager.js');
var GameManager = require('./game_manager.js');

var QLearner = require('./q-learning.js');

var learner = new QLearner(0.9);
var input = new InputManager();
var actuator = new Actuator(input, learner);
var score = new ScoreManager();

var game = new GameManager(4, input, actuator, score);

var i=0;

while(true) {
  game.actuate();
  console.log(i + ' - ' + game.score + ' - ' + score.get());
//  if (i % 10000 == 0)
//    var contents = file.writeFileSync("./qvalues.json", JSON.stringify(learner.q));
  game.restart();
  i++;
}
