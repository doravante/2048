var _ = require("underscore");

function Fourier(order, nvars){
  var self = this;	
	
  self.order = order;
  self.nterms = (order*nvars) + 1;

  self.multipliers = _(this.nterms).times(function(){
    return _(nvars).times(function() { return 0; });
  });

  var pos = 1;
		
  // Cycle through each variable.
  for(v = 0; v < nvars; v++)
  {
	// For each variable, cycle up to its order.
	for(ord = 1; ord <= order; ord++)
	{
	  self.multipliers[pos][v] = ord;
	  pos++;
	}
  }
  
  self.phi = _(self.nterms).times(function(){
    return 0;
  });
  
  self.weights = _(self.nterms).times(function(){
	  return 0;
  });
  self.weights[0] = 1;
  
  self.alpha = _(self.nterms).times(function(i){
	  return self.calculateAlpha(self.multipliers[i]);
  });
}

Fourier.prototype.calculateAlpha = function(multiplier) {
  var sum = _(multiplier).map(function(x) {return x*x;}).reduce(function(a,b) { return a+b; });
  sum = Math.sqrt(sum);
  
  if (sum == 0)
	return 1;
  else
	return 1 / sum;
}

Fourier.prototype.scaleState = function(state) {
  var min = _.min(state);		
  var max = _.max(state);
  return _(state).map(function(s) {
    return (s - min) / (max - min);
  });
}

Fourier.prototype.convertStateToArray = function(state) {
  return _.map(state.split('-'), function(x) { return Number(x); });
}

Fourier.prototype.encodeState = function(state) {
  state = this.convertStateToArray(state);
  state = this.scaleState(state);

  return _(this.multipliers).map(function(basis) {
    var s = 0;
    for (i=0; i<basis.length; i++) {
      s = basis[i] * state[i];
    }

    return Math.cos(Math.PI*s);
  });
}

Fourier.prototype.valueAt = function(state) {
  var features = this.encodeState(state);

  var s = 0;
  for (var i=0; i<this.weights.length; i++) {
    s = features[i] * this.weights[i];
  }
  
  return s;
}

Fourier.prototype.updateWeights = function(weights) {
  for (var i=0; i<this.weights.length; i++) {
	  this.weights[i] = this.alpha[i] * weights[i];
  }
}

module.exports = Fourier;
