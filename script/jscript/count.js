//!*script
// deno-lint-ignore-file no-var
/**
 * Count function
 *
 * @arg 0 Numerical value
 * @arg 1 Limit digit
 */

PPx.setIValue('ppmviResetLimit', 1);

var digit = (function (args) {
  var len = args.length;

  if (len < 1) {
    PPx.Quit(1);
  }

  return {
    value: args.Item(0),
    limit: len > 1 ? args.Item(1) : '1'
  };
})(PPx.Arguments);

var counter = function (v) {
  return PPx.Execute('*string i,ppmviG=' + v + '%:*setnextkey #K_ppmViG,!"' + v);
};
var count = PPx.getIValue('ppmviG');

counter(
  count === '01' && digit.value !== '0' ? digit.value : (count + digit.value).slice(-digit.limit)
);
