var _ = require("underscore");

function Fourier(order, nvars){
  this.order = order;

  this.nterms = (order*nvars) + 1;

  this.multipliers = _(this.nterms).times(function(){
    return _(nvars).times(function() { return 0; });
  });

  var pos = 1;
		
	// Cycle through each variable.
	for(v = 0; v < nvars; v++)
	{
		// For each variable, cycle up to its order.
		for(ord = 1; ord <= order; ord++)
		{
			this.multipliers[pos][v] = ord;
			pos++;
		}
	}
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

module.exports = Fourier;
