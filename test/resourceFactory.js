const fs = require('fs-extra');
const path = require('path');
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const parser = new XMLParser();

exports.loadSOAPRecords = async (action, mcdevAction, type,buObject) => {
    const testPath = path.join('test', 'resources', 'soap' + action,buObject.businessUnit, type, mcdevAction + '.xml');
    if (await fs.pathExists(testPath)) {
        return fs.readFile(testPath, {
            encoding: 'utf8',
        });
    } else {
        console.log('TEST FALLBACK EMPTY', testPath);
        return fs.readFile(path.join('test', 'resources', 'soap' + action, 'empty.xml'), {
            encoding: 'utf8',
        });
    }
};
exports.handleSOAPRequest = async (config, buObject) => {
    // console.log('CONFIG', config);
    const jObj = parser.parse(config.data);
    const responseXML = await this.loadSOAPRecords(
        config.headers.SOAPAction,
        'retrieve',
        jObj.Envelope.Body.RetrieveRequestMsg.RetrieveRequest.ObjectType,
        buObject
    );
    return [200, responseXML];
};
exports.soapUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.soap.marketingcloudapis.com/Service.asmx';
