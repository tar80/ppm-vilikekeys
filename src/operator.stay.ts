/* @file Simulate operator keys
 * @arg 0 {string} - Specify trigger key
 * @arg 1 {string} - Specify identification sign
 * @arg 2 {number} - The timer duration in milliseconds
 * @arg 3 {number} - Maximum number of digits in the counter. Max is 5
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import debug from '@ppmdev/modules/debug.ts';

const STAYMODE_ID = 80130;
const TIMER_INTERVAL = 400;

type Cache = {label: string; sign: string; count: string; digit: number; timer: number};
const cache = {} as Cache;

const main = (): void => {
  const [key, sign, limit, digit] = safeArgs('G', 'count:', 3000, 3);
  cache.label = `#K_ppmVi${key}`;
  cache.sign = sign;
  cache.count = '01';
  cache.digit = digit <= 5 ? digit : 5;
  cache.timer = 0;

  setNextKey();

  PPx.StayMode = STAYMODE_ID;
  const ppxkey = keyStandby(limit);
  !isEmptyStr(ppxkey) && PPx.Execute(`*string i,PPxKey=${ppxkey.replace(`${cache.label},`, '')}`);
  PPx.linemessage('!"');
  PPx.StayMode = 0;
};

const ppx_resume = (last: string): void => {
  cache.timer = 0;
  cache.count = ((): string => {
    if (cache.count === '01') {
      if (last === '0') {
        return '01';
      } else if (last === '1') {
        return '1';
      }
      return last;
    }
    return `${cache.count}${last}`.slice(-cache.digit);
  })();

  if (cache.count === '01') {
    return;
  }

  setNextKey(cache.count);
};

const ppx_Count = (): string => cache.count;

const setNextKey = (count = ''): number => PPx.Execute(`*execute C,*setnextkey ${cache.label},"!""${cache.sign}${count}"`);
const getPPxKey = (): [boolean, string] => {
  const ppxkey = PPx.Extract('%*extract(C,"%%si""PPxKey""")');

  return [!~ppxkey.indexOf(cache.label), ppxkey];
};

const keyStandby = (limit: number): string => {
  let [isClose, ppxkey] = [false, ''];

  while (cache.timer < limit) {
    cache.timer = cache.timer + TIMER_INTERVAL;
    PPx.Execute(`*wait ${TIMER_INTERVAL},2`);
    [isClose, ppxkey] = getPPxKey();

    if (isClose) {
      return '';
    }
  }

  return ppxkey;
};

main();
