var babel       = require('babel');
var path        = require('path');
var fs          = require('fs');
var async       = require('async');
var mkdirp      = require('mkdirp');

var getOptions  = require('./babel-options');
var fileName    = path.join(__dirname, '../modules/Router5.js');

function buildFactory(module, dest) {
    return function buildCommonJsModuel(done) {
        babel.transformFile(fileName, getOptions(module), function (err, result) {
            if (!err) fs.writeFile(path.join(__dirname, '..', dest), result.code, done);
            else done(err);
        });
    };
}

/**
 * Bower build
 *
 * - Flat concat all modules (router5, route-node, path-parser)
 * - Only one 'use strict', _createClass and _classCallCheck
 * - Global variables registration
 */
function buildBundle(done) {
    function transform(fileToTransform) {
        return function (done) {
            babel.transformFile(fileToTransform, {modules: 'ignore'}, done)
        }
    }

    var pathParser = path.join(__dirname, '../node_modules/route-node/node_modules/path-parser/modules/Path.js');
    var routeNode  = path.join(__dirname, '../node_modules/route-node/modules/RouteNode.js');

    async.parallel([
        fs.readFile.bind(fs, path.join(__dirname, '../LICENSE')),
        transform(pathParser),
        transform(routeNode),
        transform(fileName),
    ], function (err, results) {
        // License
        var license = results[0].toString().trim().split('\n').map(function (line) {
            return ' * ' + line;
        }).join('\n');
        license = '/**\n * @license\n' + license + '\n */';

        var pathParserSrc = results[1].code.trim();
        var routeNodeSrc = results[2].code.trim();
        var router5Src = results[3].code.trim();

        var classesSrc = pathParserSrc.replace(/("|')use strict("|');\n/g, '') +
            (routeNodeSrc + router5Src)
                .replace(/("|')use strict("|');\n/g, '')
                .replace(/\nvar _createClass(?:.*)\n/, '')
                .replace(/\nfunction _classCallCheck(?:.*)\n/, '');

        var globalVars = '\n' +
            'window.RouteNode = RouteNode;\n' +
            'window.Router5 = Router5;\n';

        var code = license + '\n(function () {\n\'use strict\';\n' + classesSrc + '\n' + globalVars + '\n}());\n';

        fs.writeFile(path.join(__dirname, '../dist/browser/router5.js'), code, done);
    })
}

mkdirp('dist/test', function () {
    async.parallel([
        buildFactory('common', 'dist/commonjs/router5.js'),
        buildFactory('umd',    'dist/umd/router5.js'),
        buildFactory('ignore', 'dist/test/router5.js'),
        buildBundle
    ], function (err) {
        if (err) console.log(err);
        process.exit(err ? 1 : 0);
    });
});
