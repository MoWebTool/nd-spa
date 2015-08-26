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
    render: function(partial, model) {
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

      partial.forEach(function(key) {
        partials[key].render(util, model);
      });
    }
  };

  // render layouts except aside
  util.layout.render('!aside');

};
