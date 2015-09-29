# nd-spa

[![spm version](http://spm.crossjs.com/badge/nd-spa)](http://spm.crossjs.com/package/nd-spa)

> Single Page Application

## 安装

```bash
$ spm install nd-spa --save
```

## 使用

### 1. 将 spa 混入 util
```js
// /mod/util.js
'use strict';

var util = {
  // 模板替换
  APP_NAME: '<%= appname %>',
  APP_VERSION: '<%= version %>',
  APP_AUTHOR: '<%= author.name %> <<%= author.email %>>',
  APP_TIMESTAMP: '<%= timestamp %>',
  SITE_TITLE: '<%= description %>'
};

// locale mixins
require('./mixins/defer')(util);

// common mixins
require('nd-spa')(util);

// locale mixins
require('./mixins/const')(util);

module.exports = util;
```

### 2. 入口文件引用 util
```js
// /index.js
window.util = require('./mod/util');
```
