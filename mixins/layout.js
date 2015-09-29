'use strict';

var partials = {
  header: require('../layout/header'),
  aside: require('../layout/aside'),
  footer: require('../layout/footer'),
  bread: require('../layout/bread'),
  rootnode: require('../layout/rootnode')
};

module.exports = function(util) {

  document.title = (document.title + ' ' + util.SITE_TITLE).trim();

  util.layout = {
    render: function(partial, model, isLogin) {
      if (partial) {
        if (!Array.isArray(partial)) {
          if (partial.charAt(0) === '!') {
            partial = partial.substring(1);
            partial = Object.keys(partials).filter(function(key) {
              return key !== partial;
            });
          } else {
            partial = [partial];
          }
        }
      } else {
        partial = Object.keys(partials);
      }

      if (typeof isLogin === 'undefined') {
        isLogin = util.auth.isLogin();
      }

      partial.forEach(function(key) {
        partials[key].render(util, model, isLogin);
      });
    }
  };

  // render layouts except aside
  setTimeout(util.layout.render, 0, '!aside');

};
