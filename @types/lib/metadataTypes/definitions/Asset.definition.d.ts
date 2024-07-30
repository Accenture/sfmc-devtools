declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let asset: string[];
    }
    let folderType: string;
    let hasExtended: boolean;
    let idField: string;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let createdDateField: string;
    let createdNameField: string;
    let lastmodDateField: string;
    let lastmodNameField: string;
    let restPagination: boolean;
    let maxKeyLength: number;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: string[];
    let typeName: string;
    let stringifyFieldsBeforeTemplate: string[];
    let allowMatchingByName: boolean;
    let fields: {
        activeDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        allowedBlocks: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        assetType: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'assetType.displayName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'assetType.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'assetType.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        availableViews: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        modelVersion: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        blocks: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        businessUnitAvailability: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%.view': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%.update': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%.delete': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%.memberId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'businessUnitAvailability.%.transferOwnership': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        category: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'category.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'category.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'category.parentId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        channels: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        content: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        contentType: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'createdBy.email': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'createdBy.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'createdBy.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'createdBy.userId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        createdDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        customerKey: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        customFields: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'data.campaigns': {
            skipValidation: boolean;
        };
        'data.approvals': {
            skipValidation: boolean;
        };
        'data.email': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'data.email.attributes': {
            skipValidation: boolean;
        };
        'data.email.legacy': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'data.email.options': {
            skipValidation: boolean;
        };
        'data.portfolio': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        description: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        design: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        enterpriseId: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        file: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.fileName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.extension': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.externalUrl': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.fileSize': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.fileCreatedDate': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.width': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.height': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'fileProperties.publishedURL': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        id: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        legacyData: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        locked: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        maxBlocks: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        memberId: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        meta: {
            skipValidation: boolean;
        };
        minBlocks: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'modifiedBy.email': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'modifiedBy.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'modifiedBy.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'modifiedBy.userId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        modifiedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        name: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        objectID: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        owner: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'owner.email': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'owner.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'owner.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'owner.userId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        sharingProperties: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'sharingProperties.localAssets': {
            skipValidation: boolean;
        };
        'sharingProperties.sharedWith': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'sharingProperties.sharedFrom': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'sharingProperties.sharedFromMID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'sharingProperties.sharingType': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        slots: {
            skipValidation: boolean;
        };
        'status.id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'status.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        superContent: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        tags: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        template: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        thumbnail: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        version: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        views: {
            skipValidation: boolean;
        };
        r__folder_Path: {
            skipValidation: boolean;
        };
    };
    let subTypes: string[];
    let crosslinkedSubTypes: string[];
    let selflinkedSubTypes: string[];
    let binarySubtypes: string[];
    namespace extendedSubTypes {
        let asset_1: string[];
        export { asset_1 as asset };
        export let image: string[];
        export let rawimage: string[];
        export let video: string[];
        export let document: string[];
        export let audio: string[];
        export let archive: string[];
        export let code: string[];
        export let textfile: string[];
        export let block: string[];
        export let template: string[];
        export let message: string[];
        export let other: string[];
    }
    let typeMapping: {
        asset: number;
        file: number;
        block: number;
        template: number;
        message: number;
        custom: number;
        default: number;
        image: number;
        rawimage: number;
        video: number;
        document: number;
        audio: number;
        archive: number;
        code: number;
        textfile: number;
        ai: number;
        psd: number;
        pdd: number;
        eps: number;
        gif: number;
        jpe: number;
        jpeg: number;
        jpg: number;
        jp2: number;
        jpx: number;
        pict: number;
        pct: number;
        png: number;
        tif: number;
        tiff: number;
        tga: number;
        bmp: number;
        wmf: number;
        vsd: number;
        pnm: number;
        pgm: number;
        pbm: number;
        ppm: number;
        svg: number;
        '3fr': number;
        ari: number;
        arw: number;
        bay: number;
        cap: number;
        crw: number;
        cr2: number;
        dcr: number;
        dcs: number;
        dng: number;
        drf: number;
        eip: number;
        erf: number;
        fff: number;
        iiq: number;
        k25: number;
        kdc: number;
        mef: number;
        mos: number;
        mrw: number;
        nef: number;
        nrw: number;
        orf: number;
        pef: number;
        ptx: number;
        pxn: number;
        raf: number;
        raw: number;
        rw2: number;
        rwl: number;
        rwz: number;
        srf: number;
        sr2: number;
        srw: number;
        x3f: number;
        '3gp': number;
        '3gpp': number;
        '3g2': number;
        '3gp2': number;
        asf: number;
        avi: number;
        m2ts: number;
        mts: number;
        dif: number;
        dv: number;
        mkv: number;
        mpg: number;
        f4v: number;
        flv: number;
        mjpg: number;
        mjpeg: number;
        mxf: number;
        mpeg: number;
        mp4: number;
        m4v: number;
        mp4v: number;
        mov: number;
        swf: number;
        wmv: number;
        rm: number;
        ogv: number;
        indd: number;
        indt: number;
        incx: number;
        wwcx: number;
        doc: number;
        docx: number;
        dot: number;
        dotx: number;
        mdb: number;
        mpp: number;
        ics: number;
        xls: number;
        xlsx: number;
        xlk: number;
        xlsm: number;
        xlt: number;
        xltm: number;
        csv: number;
        tsv: number;
        tab: number;
        pps: number;
        ppsx: number;
        ppt: number;
        pptx: number;
        pot: number;
        thmx: number;
        pdf: number;
        ps: number;
        qxd: number;
        rtf: number;
        sxc: number;
        sxi: number;
        sxw: number;
        odt: number;
        ods: number;
        ots: number;
        odp: number;
        otp: number;
        epub: number;
        dvi: number;
        key: number;
        keynote: number;
        pez: number;
        aac: number;
        m4a: number;
        au: number;
        aif: number;
        aiff: number;
        aifc: number;
        mp3: number;
        wav: number;
        wma: number;
        midi: number;
        oga: number;
        ogg: number;
        ra: number;
        vox: number;
        voc: number;
        '7z': number;
        arj: number;
        bz2: number;
        cab: number;
        gz: number;
        gzip: number;
        iso: number;
        lha: number;
        sit: number;
        tgz: number;
        jar: number;
        rar: number;
        tar: number;
        zip: number;
        gpg: number;
        htm: number;
        html: number;
        xhtml: number;
        xht: number;
        css: number;
        less: number;
        sass: number;
        js: number;
        json: number;
        atom: number;
        rss: number;
        xml: number;
        xsl: number;
        xslt: number;
        md: number;
        markdown: number;
        as: number;
        fla: number;
        eml: number;
        text: number;
        txt: number;
        freeformblock: number;
        textblock: number;
        htmlblock: number;
        textplusimageblock: number;
        imageblock: number;
        abtestblock: number;
        dynamicblock: number;
        stylingblock: number;
        einsteincontentblock: number;
        webpage: number;
        webtemplate: number;
        templatebasedemail: number;
        htmlemail: number;
        textonlyemail: number;
        socialshareblock: number;
        socialfollowblock: number;
        buttonblock: number;
        layoutblock: number;
        defaulttemplate: number;
        smartcaptureblock: number;
        smartcaptureformfieldblock: number;
        smartcapturesubmitoptionsblock: number;
        slotpropertiesblock: number;
        externalcontentblock: number;
        codesnippetblock: number;
        rssfeedblock: number;
        formstylingblock: number;
        referenceblock: number;
        imagecarouselblock: number;
        customblock: number;
        liveimageblock: number;
        livesettingblock: number;
        contentmap: number;
        jsonmessage: number;
        icemailformblock: number;
    };
}
export default _default;
//# sourceMappingURL=Asset.definition.d.ts.map