const File = require('../lib/util/file');
const path = require('path');
exports.getActualSoap= (result, type) =>{
    return File.readJSON(
        `./retrieve/testInstance/testBU/${type}/${Object.keys(result[type])[0]}.${type}-meta.json`
    );

}
exports.getExpectedSoap=(buName, type, action)=>{
    return File.readJSON(
        path.join(
            'test',
            'resources',
            'soapRetrieve',
            buName,
            type,
            action + '.json'
        )
    );

}
