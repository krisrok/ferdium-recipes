"use strict";

module.exports = Ferdium => class Messenger extends Ferdium {
  overrideUserAgent() {
    return window.navigator.userAgent.replace(/(Ferdium|Electron)(\S+\s)/g, '');
  }
};
