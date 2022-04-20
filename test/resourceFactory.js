const fs = require('fs-extra');
const path = require('path');
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const parser = new XMLParser();

// exports.loadType = async (testName, type, action) => {
//     const obj = {};
//     obj.request = await fs.readFile(
//         path.resolve('test', 'resources', type, action + '-request.xml'),
//         {
//             encoding: 'utf-8',
//         }
//     );

//     obj.response = await fs.readFile(
//         path.resolve('test', 'resources', type, action + '-response.xml'),
//         {
//             encoding: 'utf-8',
//         }
//     );

//     return obj;
// };
exports.loadSOAPRecords = async (action, mcdevAction, type) => {
    const testPath = path.join('test', 'resources', 'soap' + action, type, mcdevAction + '.xml');
    if (await fs.pathExists(testPath)) {
        return fs.readFile(testPath, {
            encoding: 'utf8',
        });
    } else {
        return fs.readFile(path.join('test', 'resources', 'soap' + action, 'empty.xml'), {
            encoding: 'utf8',
        });
    }
};
exports.handleSOAPRequest = async (config) => {
    // console.log('CONFIG', config);
    const jObj = parser.parse(config.data);
    const responseXML = await this.loadSOAPRecords(
        config.headers.SOAPAction,
        'retrieve',
        jObj.Envelope.Body.RetrieveRequestMsg.RetrieveRequest.ObjectType
    );
    return [200, responseXML];
};
exports.soapUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.soap.marketingcloudapis.com/Service.asmx';
