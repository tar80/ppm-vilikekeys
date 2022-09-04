//!*script
/**
 * Count function
 *
 * @arg 0 Numerical value
 * @arg 1 Limit digit
 */

'use strict';

PPx.setIValue('ppmviResetLimit', 1);

const digit = ((args = PPx.Arguments) => {
  const len = args.length;

  if (len < 1) {
    PPx.Quit(1);
  }

  return {
    value: args.Item(0),
    limit: len > 1 ? args.Item(1) : '1'
  };
})();

const counter = (v) => PPx.Execute(`*string i,ppmviG=${v}%:*setnextkey #K_ppmViG,!"${v}`);
const count = PPx.getIValue('ppmviG');

counter(
  count === '01' && digit.value !== '0' ? digit.value : `${count}${digit.value}`.slice(-digit.limit)
);
