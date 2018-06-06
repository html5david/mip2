/**
 * @file unsafe-replace.js
 * @author clark-t (clarktanglei@163.com)
 */

var escodegen = require('escodegen')
var detect = require('./global-detect')
var keywords = require('./keywords')
var is = require('./utils/is')
var t = require('./utils/type')

var WINDOW_SAFE_KEYWORDS = keywords.WINDOW_ORIGINAL_KEYWORDS
  .concat(keywords.RESERVED_KEYWORDS)

function sandboxExpression (name) {
  return t.memberExpression(
    t.memberExpression(
      t.identifier('MIP'),
      t.identifier('sandbox')
    ),
    t.identifier(name)
  )
}

function safeThisExpression () {
  return t.callExpression(
    sandboxExpression('this'),
    [t.thisExpression()]
  )
}

module.exports = function (code, options) {
  var ast = detect(
    code,
    function (node) {
      if (is(node, 'ThisExpression')) {
        this.skip()
        return safeThisExpression()
      }

      if (WINDOW_SAFE_KEYWORDS.indexOf(node.name) === -1) {
        this.skip()
        return sandboxExpression(node.name)
      }
    },
    'replace'
  )

  return escodegen.generate(ast, options)
}
