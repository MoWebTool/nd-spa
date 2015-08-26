'use strict';

module.exports = function(global) {
  require('./mixins/dollar')(global);
  require('./mixins/unique')(global);
  require('./mixins/avatar')(global);
  require('./mixins/session')(global);
  require('./mixins/storage')(global);
  require('./mixins/const')(global);
  require('./mixins/console')(global);
  require('./mixins/progress')(global);
  require('./mixins/rest')(global);
  require('./mixins/auth')(global);
  require('./mixins/bread')(global);
  require('./mixins/layout')(global);
  require('./mixins/use')(global);
  require('./mixins/route')(global);
  require('./mixins/async')(global);
};
