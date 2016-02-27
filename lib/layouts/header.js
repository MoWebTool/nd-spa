'use strict';

var $ = require('nd-jquery');
var __ = require('nd-i18n');

var Widget = require('nd-widget');
var Template = require('nd-template');
var Select = require('nd-select');

var Profile = require('./profile');

var util = require('../../index');
var auth = require('../auth');
var avatar = require('../avatar');
var routes = require('../routes');
var storage = require('../storage');

var Header = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./header.handlebars'),
    model: {},
    insertInto: function(element, parentNode) {
      $(parentNode).empty().append(element);
    }
  }
});

exports.render = function(router) {
  var isLogin = auth.isLogin();

  var languages = __.languages;
  var lang = storage.get('LANG');

  if (languages) {
    languages = Object.keys(languages).map(function(key) {
      return {
        text: languages[key],
        value: key,
        selected: lang === key
      };
    });

    if (!languages.length) {
      languages = null;
    }
  }

  var userdata;

  if (isLogin) {
    userdata = auth.getAuth('user_info');
    if (userdata) {
      userdata.avatar = avatar(userdata['user_id']);
      userdata['avatar_alt'] = require('../assets/blank.gif');
    }
  }

  new Header({
    parentNode: '#header',
    className: languages ? 'has-i18n' : 'no-i18n',
    model: {
      title: util.APP_DESCRIPTION,
      authed: isLogin,
      languages: languages,
      userdata: userdata,
      routes: isLogin ? routes.HEADER_ROUTES : null
    },
    events: {
      'click .route-me': function(e) {
        var baseElement = $(e.currentTarget);

        if (!this.profile) {
          this.profile = new Profile({
            parentNode: this.element,
            align: {
              baseElement: baseElement
            },
            model: this.get('model')
          }).on('change:visible', function(visible) {
            baseElement.toggleClass('active', visible);
          });
        }

        this.profile.get('visible') ? this.profile.hide() : this.profile.show();
      },
      'click button': function() {
        router.render('rootnode', {
          // toggle state
          collapsed: -1
        });
      }
    },
    afterRender: function() {
      if (languages) {
        new Select({
          className: 'ui-select-dark',
          trigger: this.$('[data-role="i18n"]'),
          triggerTpl: '<a class="iconfont iconfont-global" href="#"></a>'
        }).on('change', function() {
          lang = this.get('value');
          storage.set('LANG', lang);

          var search = location.search;
          var keyVal = 'lang=' + lang;
          var regexp = /([?&])lang=[-_\w]+/;

          if (search) {
            if (regexp.test(search)) {
              search = search.replace(regexp, '$1' + keyVal);
            } else {
              search += '&' + keyVal;
            }
          } else {
            search = keyVal;
          }

          // reload
          location.search = search;
        }).render();
      }
    }
  }).render();
};
