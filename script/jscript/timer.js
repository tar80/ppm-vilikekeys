//!*script
/**
 * Timer for Operator key
 *
 * @arg 0 Operator key. G | Y
 * @arg 1 Operate message
 * @arg 2 Limit time(milliseconds)
 */

var g_operate = (function (args) {
  var arr = ['G', '', 3000];
  var len = args.length;

  if (len < 1) {
    PPx.Quit(1);
  }

  for (var i = 0; i < len; i++) {
    arr[i] = args.Item(i);
  }

  return {
    key: arr[0],
    msg: arr[1].replace('"', '""'),
    limit: Number(arr[2])
  };
})(PPx.Arguments);

PPx.Execute('*execute C,*setnextkey #K_ppmVi' + g_operate.key + ',"' + g_operate.msg + '"');

var n = PPx.Extract('%n');
var mapkey = PPx.getIValue('PPxKey');
var keyword = '#K_ppmVi' + g_operate.key + ',';
var t = 0;

while (t < g_operate.limit) {
  PPx.Execute('*wait 400,2');

  if (g_operate.key === 'G' && PPx.Extract('%*extract(C,"%%si""ppmviG""")') === '') {
    PPx.Execute('*execute ' + n + ',*string i,ppmviG=%%:*linemessage !"');

    if (~mapkey.indexOf(keyword)) {
      PPx.Execute('*string i,PPxKey=' + mapkey.replace(keyword, ''));
    }

    PPx.Quit(1);
  }

  if (!~PPx.Extract('%*extract(C,"%%si""PPxKey""")').indexOf(keyword)) {
    g_operate.key === 'G'
      ? PPx.setIValue('ppmviG', '')
      : PPx.Execute('*execute ' + n + ',*string i,PPxKey=' + mapkey.replace(keyword, '') + '%%:*linemessage !"');

    PPx.Quit(1);
  }

  if (PPx.getIValue('ppmviResetLimit') !== '') {
    t = 0;
    PPx.setIValue('ppmviResetLimit', '');
  }

  t = t + 500;
}

PPx.Execute('%k"esc"');

if (g_operate.key === 'G') {
  PPx.setIValue('ppmviG', '');
}
