/* @file Simulate operator keys
 * @arg 0 {string} - Specify trigger key. When two letters, the first letter is considered xID
 * @arg 1 {string} - Specify identification sign
 * @arg 2 {number} - The timer duration in milliseconds
 * @arg 3 {number} - Maximum number of digits in the counter. Max is 5
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import debug from '@ppmdev/modules/debug.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';

const STAYMODE_ID = 80130;
const TIMER_INTERVAL = 400;

type XID = 'C' | 'V' | 'E';
type Cache = {xID: XID; label: string; sign: string; count: string; digit: number; timer: number; msgPrefix: '!""' | ''};
const cache = {msgPrefix: '!""'} as Cache;

const main = (): void => {
  const [key, sign, limit, digit] = safeArgs('G', 'count:', 3000, 3);

  cache.xID = presentOrC(key);
  cache.label = `#K_ppmVi${key}`;
  cache.sign = sign.replace(/"/g, '""');
  cache.count = '0';
  cache.digit = digit <= 5 ? digit : 5;
  cache.timer = 0;

  PPx.StayMode = STAYMODE_ID;
  setNextKey();
  const isClose = keyStandby(limit);
  !isClose && PPx.Execute('%k"@V_HF0"');
  PPx.StayMode = 0;
};

const ppx_resume = (last: string): void => {
  cache.timer = 0;
  cache.count = ((): string => {
    if (cache.count === '0') {
      if (last === '0') {
        return '0';
      }

      return last;
    }

    return `${cache.count}${last}`.slice(-cache.digit);
  })();

  if (cache.count === '0') {
    PPx.Execute('%k"@V_HF0@0"');

    return;
  }

  setNextKey(cache.count);
};

const ppx_Count = (): string => cache.count;

/**
 * @desc Returns the ID of xUI that executes the operator command
 * @arg key - Target ID of xUI
 * @return ID of xUI
 */
const presentOrC = (key: string): XID => {
  if (key.length === 2 && /^[ev].$/i.test(key)) {
    cache.msgPrefix = '';

    return key.slice(0, 1).toUpperCase() as XID;
  }

  return 'C';
};

/**
 * @desc Set operator mode
 * @arg count - value of counter
 */
const setNextKey = (count = ''): void => {
  PPx.Execute(`*execute ${cache.xID}, *setnextkey ${cache.label},"${cache.msgPrefix}${cache.sign}${count}"`);
};

/**
 * @desc Get the value of PPxKey of special variable i and check if operator is registered
 * @return [is registered operator, value of %si'PPxKey']
 */
const getPPxKey = (): boolean => {
  const ppxkey = PPx.Extract(`%*extract(${cache.xID},"%%si'PPxKey'")`);

  return !~ppxkey.indexOf(cache.label);
};

/**
 * @desc Operator key standby
 * @arg limit - standby time in milliseconds
 * @return - value of %si'PPxKey'
 */
const keyStandby = (limit: number): boolean => {
  let isClose = false;

  while (!isClose && cache.timer < limit) {
    cache.timer = cache.timer + TIMER_INTERVAL;
    PPx.Execute(`*wait ${TIMER_INTERVAL},2`);
    isClose = getPPxKey();
  }

  return isClose;
};

main();
