function MockScoreManager() {
  this.score = 0;
}

MockScoreManager.prototype.get = function () {
  return this.score;
};

MockScoreManager.prototype.set = function (score) {
  this.score = score;
};

module.exports = MockScoreManager;
