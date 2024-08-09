/* @file Get the index of display position
 * @arg 0 {string} - Specify the location to position. "high" | "middle" | "low"
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import debug from '@ppmdev/modules/debug.ts';

const main = () => {
  const [target] = validArgs();
  const [top, bottom] = getLineRange();

  if (target === 'low') {
    setCursor(top + bottom - 1);
  } else if (target === 'middle') {
    setCursor(top + bottom / 2 - 1);
  } else {
    setCursor(top);
  }
};

const setCursor = (idx: number): number => (PPx.EntryIndex = idx);

const getLineRange = (): [number, number] => {
  const currentIndex = PPx.EntryIndex;
  const displayBottom = PPx.EntryDisplayY;
  const lineTop = Math.floor(currentIndex / displayBottom) * displayBottom;

  return [lineTop, displayBottom];
};

main();
