'use strict';

module.exports = function(util) {

  var seed = 0;

  util.async = function(before, after) {
    var _seed = ++seed;
    var _path = util.getPath();

    before(function() {
      if (_seed === seed && _path === util.getPath()) {
        after.apply(null, arguments);
      }
    });
  };

};
