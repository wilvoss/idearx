var UseDebug = document.location.href.indexOf('staging') != -1 || document.location.href.indexOf('pp') != -1 || document.location.href.indexOf('localhost') != -1;

function announce(text) {
  console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
  log(text, null, true);
  console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
}

function highlight(text) {
  log(text, 'color:green;');
}

function warn(text) {
  log(text, 'color:orange;');
}

function error(text) {
  log(text, 'color:red;');
}

function note(text) {
  log(text, 'color:gray;');
}

function log(text, color, override = false) {
  text = text.toString();

  color = color === undefined || color === null ? null : color;

  var ms = new Date(Date.now()).getMilliseconds();
  ms = ms < 10 ? ms * 100 : ms;
  ms = ms < 100 ? ms * 10 : ms;
  if (UseDebug || override) {
    console.log('%c' + new Date(Date.now()).toLocaleTimeString('en-US').replace(/ AM/, '').replace(/ PM/, '') + '.' + ms + ' \t%c' + text, 'color:lightgray;', color);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function loadScript(filename) {
  var script = document.createElement('script');
  script.src = filename;
  script.type = 'text/javascript';
  document.head.appendChild(script);
}

function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.textContent = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy'); // Security exception may be thrown by some browsers
  } catch (ex) {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
