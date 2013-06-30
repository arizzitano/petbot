// ANSI color support and simpler child process execution
// Dan Tillberg <dan@tillberg.us>

var cproc = require('child_process');
var _ = require('underscore')._;
_.mixin(require('underscore.string'));

// ANSI color code outputs for strings
// Adapted from https://github.com/loopj/commonjs-ansi-color

var ANSI_CODES = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "gray": 30 + 60,
  "grey": 30 + 60,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};

function setcolor(str, color, intense) {
  if(!color) return str;
  var ansi_str = "";
  ansi_str += "\033[" + ((intense ? 60 : 0) + (ANSI_CODES[color] || color)) + "m";
  ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";
  return ansi_str;
};
function colored_text(str) {
  var any = false;
  return str.replace(/<<(\w+)>>|<<\*(\w+)\*>>/gi, function(match, color, intense_color) {
    any = true;
    var c = color || intense_color;
    return "\033[" + ((intense_color ? 60 : 0) + (ANSI_CODES[c] != null ? ANSI_CODES[c] : c)) + "m"
  }) + (any ? "\033[" + ANSI_CODES["off"] + "m" : '');
}
exports.colored_text = colored_text;

function exec(cmd, args, opts, cb) {
  if (!opts || !opts.cwd) {
    error('cwd not specified in ' + cmd + ' ' + args.join(' '));
  }
  var proc = cproc.spawn(cmd, args, opts),
      out = [],
      err = [];
  function log(x) {
    process.stdout.write(x + '');
  }
  var lineBuffer = '';
  proc.stdout.on('data', function (data) {
    lineBuffer = lineBuffer + data;
    while (true) {
      var lineMatch = lineBuffer.match(/(.+)\n/);
      if (lineMatch) {
        var line = lineMatch[1];
        if (opts.pipe) {
          var prefix = '';
          if (opts.name) {
            prefix = '<<blue>>' + _.pad(opts.name, 12) + '<<grey>>: ';
          }
          info(prefix + line);
        }
        proc.stdout.emit('line', line);
        lineBuffer = lineBuffer.replace(/.+\n/, '');
      } else {
        break;
      }
    };
    out.push(data);
  });
  proc.stderr.on('data', function (data) {
    log(data);
    err.push(data);
  });
  proc.on('exit', function (code) {
    if (cb) {
      cb(code, out.join(''), err.join(''));
    }
  });
  if (opts.data) {
    proc.stdin.write(opts.data);
    proc.stdin.end();
  }
  return proc;
}

global.exec = exec;

var util = require('util');
global.debug = function(x, name) {
  global.error((name ? name + ': ' : '') + util.inspect(x));
};

global.error = function () {
  var s = util.format.apply(null, arguments);
  console.error(colored_text('<<red>>' + s));
};

global.warn = function () {
  var s = util.format.apply(null, arguments);
  console.warn(colored_text('<<yellow>>' + s));
};

global.info = function () {
  var s = util.format.apply(null, arguments);
  console.log(colored_text('<<grey>>' + s));
};
