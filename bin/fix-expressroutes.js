/**
 * Totally hacky script to fix a bug in swaggerize-express while https://github.com/krakenjs/swaggerize-express/pull/69 is pending.
 */

var fs = require('fs');
var path = require('path');

var switchFnRegex = /switch \(parameter\.in\) \{[^\}]*\}/g;
var switchFn = "switch (parameter.in) {\n \
                    case 'path':\n \
                        isPath = true;\n \
                        value = req.params[parameter.name];\n \
                        break;\n \
                    case 'query':\n \
                        value = req.query[parameter.name];\n \
                        break;\n \
                    case 'header':\n \
                        value = req.get(parameter.name);\n \
                        break;\n \
                    case 'body':\n \
                        isBody = true;\n \
                        value = req.body;\n \
                        break;\n \
                    case 'formData':\n \
                        isFormData = true;\n \
                        value = req.body[parameter.name];\n \
                        break;\n \
                }\n \
";

var ifClauseRegex = /if \(isPath\) \{[^\}]*\}/g;
var ifClause = "if (isPath) {\n \
                  req.params[parameter.name] = newvalue;\n \
                }\n \
                \n \
                if (parameter.in === 'query') {\n \
                  req.query[parameter.name] = newvalue;\n \
                }\n \
";

var fileName = path.join(__dirname, '../node_modules/swaggerize-express/lib/expressroutes.js');

var fixExpressroutes = function() {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) {
      throw err;
    }

    data = data.replace(switchFnRegex, switchFn);
    data = data.replace(ifClauseRegex, ifClause);

    fs.writeFile(fileName, data, 'utf8', function (err) {
       if (err) {
         throw err;
       }
    });
  });
};

fixExpressroutes();