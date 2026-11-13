import * as chai from 'chai';
import { getSourceTables, parseSourceTables } from '../lib/util/sqlTables.js';

/** @type {typeof chai.assert} */
const assert = chai.assert;

/**
 * helper to keep the assertions short
 *
 * @param {string} sql query text
 * @returns {string[]} table names, ENT. tables prefixed with "ENT."
 */
function tables(sql) {
    return getSourceTables(sql).map((table) => (table.isEnt ? 'ENT.' : '') + table.name);
}

describe('util: sqlTables', () => {
    it('returns an empty list for empty or missing SQL', () => {
        assert.deepEqual(getSourceTables(''), []);
        assert.deepEqual(getSourceTables(' '.repeat(3)), []);
        assert.deepEqual(getSourceTables(), []);
    });

    it('finds the table after FROM', () => {
        assert.deepEqual(getSourceTables('SELECT a FROM Orders'), [
            { name: 'Orders', isEnt: false },
        ]);
    });

    it('finds tables of every JOIN kind and of APPLY', () => {
        const sql = `
            SELECT o.a
            FROM Orders o
            JOIN Customers c ON c.id = o.customerId
            INNER JOIN Products p ON p.id = o.productId
            LEFT JOIN Stores s ON s.id = o.storeId
            LEFT OUTER JOIN Regions r ON r.id = s.regionId
            RIGHT JOIN Coupons cp ON cp.id = o.couponId
            RIGHT OUTER JOIN Vouchers v ON v.id = o.voucherId
            FULL JOIN Returns rt ON rt.orderId = o.id
            FULL OUTER JOIN Refunds rf ON rf.orderId = o.id
            CROSS JOIN Settings
            CROSS APPLY (SELECT TOP 1 x FROM LastVisit lv WHERE lv.id = o.id) lastVisit
            OUTER APPLY (SELECT TOP 1 y FROM LastClick lc WHERE lc.id = o.id) lastClick`;
        assert.deepEqual(tables(sql), [
            'Orders',
            'Customers',
            'Products',
            'Stores',
            'Regions',
            'Coupons',
            'Vouchers',
            'Returns',
            'Refunds',
            'Settings',
            'LastVisit',
            'LastClick',
        ]);
    });

    it('finds comma separated tables with and without aliases', () => {
        assert.deepEqual(tables('SELECT a FROM Orders o, Customers AS c, Products WHERE 1=1'), [
            'Orders',
            'Customers',
            'Products',
        ]);
    });

    it('reads [bracketed] and "quoted" names, including spaces and escaped brackets', () => {
        assert.deepEqual(
            tables(
                'SELECT a FROM [Order Lines] ol JOIN "Customer Data" cd ON 1=1 JOIN [odd]]name] x ON 1=1'
            ),
            ['Order Lines', 'Customer Data', 'odd]name']
        );
    });

    it('marks tables with ENT. prefix', () => {
        assert.deepEqual(
            getSourceTables(
                'SELECT a FROM ENT.SharedOrders s JOIN ent.[Shared Customers] c ON 1=1'
            ),
            [
                { name: 'SharedOrders', isEnt: true },
                { name: 'Shared Customers', isEnt: true },
            ]
        );
    });

    it('keeps ENT. and local tables with the same name apart', () => {
        assert.deepEqual(tables('SELECT a FROM Orders JOIN ENT.Orders e ON 1=1'), [
            'Orders',
            'ENT.Orders',
        ]);
    });

    it('ignores line and block comments', () => {
        const sql = `
            -- FROM CommentedLine
            SELECT a /* FROM CommentedBlock
            JOIN AlsoCommented */
            FROM Orders -- JOIN Trailing`;
        assert.deepEqual(tables(sql), ['Orders']);
    });

    it('ignores FROM and JOIN inside string literals', () => {
        assert.deepEqual(
            tables(
                "SELECT 'FROM Fake' AS a, 'it''s JOIN Fake2' AS b FROM Orders WHERE c = 'FROM Fake3'"
            ),
            ['Orders']
        );
    });

    it('ignores FROM inside function calls', () => {
        assert.deepEqual(tables("SELECT TRIM('x' FROM name) AS n FROM Orders"), ['Orders']);
    });

    it('finds tables inside subqueries but not the subquery itself', () => {
        const sql = `
            SELECT a
            FROM (SELECT a FROM Inner1) sub
            WHERE a IN (SELECT a FROM Inner2)
            AND EXISTS (SELECT 1 FROM Inner3 i WHERE i.a = sub.a)`;
        assert.deepEqual(tables(sql), ['Inner1', 'Inner2', 'Inner3']);
    });

    it('continues a comma list after a derived table', () => {
        assert.deepEqual(tables('SELECT a FROM (SELECT a FROM Inner1) sub, Outer1 o'), [
            'Outer1',
            'Inner1',
        ]);
    });

    it('skips CTE names but finds the tables used inside CTEs', () => {
        const sql = `
            WITH recent AS (SELECT a FROM Orders WHERE d > GETDATE() - 7),
            top_customers (id) AS (SELECT id FROM Customers)
            SELECT r.a FROM recent r JOIN top_customers t ON t.id = r.a`;
        assert.deepEqual(tables(sql), ['Orders', 'Customers']);
    });

    it('does not confuse table hints or TOP WITH TIES with CTEs', () => {
        assert.deepEqual(tables('SELECT TOP 1 WITH TIES a FROM Orders WITH (NOLOCK) ORDER BY a'), [
            'Orders',
        ]);
    });

    it('skips system data views, also with ENT. prefix', () => {
        const sql = `
            SELECT s.SubscriberKey
            FROM _Subscribers s
            JOIN _Sent se ON se.SubscriberKey = s.SubscriberKey
            JOIN ENT._Open o ON o.SubscriberKey = s.SubscriberKey
            JOIN Orders ord ON ord.key = s.SubscriberKey`;
        assert.deepEqual(tables(sql), ['Orders']);
    });

    it('skips names with mustache placeholders', () => {
        const sql = `
            SELECT a
            FROM {{{prefix}}}_Orders o
            JOIN [{{{market}}} Customers] c ON 1=1
            JOIN Products{{suffix}} p ON 1=1
            JOIN Stores s ON s.name = '{{{storeName}}}'`;
        assert.deepEqual(tables(sql), ['Stores']);
    });

    it('skips table variables, temp tables and table-valued functions', () => {
        assert.deepEqual(
            tables(
                "SELECT a FROM @list l JOIN #temp t ON 1=1 CROSS APPLY OPENJSON(l.json, '$.x') j JOIN Orders o ON 1=1"
            ),
            ['Orders']
        );
    });

    it('ignores case of keywords and removes duplicates regardless of case', () => {
        assert.deepEqual(
            tables('select a from Orders o left join ORDERS o2 on 1=1 Join [orders] o3 On 1=1'),
            ['Orders']
        );
    });

    it('handles multiple statements and UNION', () => {
        assert.deepEqual(
            tables('SELECT a FROM Orders UNION ALL SELECT a FROM Archive WHERE 1=1; SELECT 1'),
            ['Orders', 'Archive']
        );
    });

    it('reads unquoted names with letters of any language', () => {
        assert.deepEqual(
            tables(
                'SELECT a FROM Kunden_Übersicht k JOIN Клиенты c ON 1=1 JOIN Commandes_été e ON 1=1'
            ),
            ['Kunden_Übersicht', 'Клиенты', 'Commandes_été']
        );
    });

    it('ignores nested block comments', () => {
        assert.deepEqual(
            tables('SELECT a /* old: /* FROM Inner */ JOIN Fake ON 1=1 */ FROM Orders'),
            ['Orders']
        );
    });

    it('finds tables in bracketed join groups', () => {
        const sql = `
            SELECT a
            FROM Orders o
            LEFT JOIN (Customers c INNER JOIN Stores s ON s.id = c.storeId) ON c.id = o.customerId
            JOIN ((Regions r JOIN Countries co ON co.id = r.countryId) JOIN Zones z ON z.id = r.zoneId) ON r.id = s.regionId`;
        assert.deepEqual(tables(sql), [
            'Orders',
            'Customers',
            'Stores',
            'Regions',
            'Countries',
            'Zones',
        ]);
    });

    it('reports names with mustache placeholders and unreadable positions as skipped', () => {
        const result = parseSourceTables(`
            SELECT a
            FROM {{{prefix}}}_Orders o
            JOIN { { { market } } }_Customers c ON 1=1
            JOIN Stores s ON 1=1
            CROSS APPLY OPENJSON(s.json) j
            JOIN (SELECT b FROM Products) p ON 1=1`);
        assert.deepEqual(result.tables, [
            { name: 'Stores', isEnt: false },
            { name: 'Products', isEnt: false },
        ]);
        // functions and subqueries are skipped on purpose and therefore not reported
        assert.deepEqual(result.skipped, [
            { reason: 'template', text: 'FROM {{...}}_Orders o JOIN' },
            { reason: 'unreadable', text: 'JOIN { { {' },
        ]);
    });

    it('does not throw on incomplete SQL', () => {
        assert.deepEqual(tables('SELECT a FROM'), []);
        assert.deepEqual(tables('SELECT a FROM WHERE'), []);
        assert.deepEqual(tables("SELECT 'unclosed FROM Fake"), []);
        assert.deepEqual(tables('SELECT a FROM [unclosed'), ['unclosed']);
        assert.deepEqual(tables('SELECT a FROM Orders /* unclosed'), ['Orders']);
        assert.deepEqual(parseSourceTables('SELECT a FROM').skipped, [
            { reason: 'unreadable', text: 'FROM' },
        ]);
        assert.deepEqual(parseSourceTables('SELECT a FROM WHERE b = 1').skipped, [
            { reason: 'unreadable', text: 'FROM WHERE b =' },
        ]);
    });

    describe('realistic Marketing Cloud queries', () => {
        /** @type {{title: string, sql: string, expected: string[]}[]} */
        const corpus = [
            {
                title: 'opens of the last 7 days',
                sql: `
                    SELECT o.SubscriberKey, MAX(o.EventDate) AS LastOpen
                    FROM _Open o
                    WHERE o.EventDate > DATEADD(DAY, -7, GETDATE())
                    GROUP BY o.SubscriberKey`,
                expected: [],
            },
            {
                title: 'enrich a master DE with send data',
                sql: `
                    SELECT m.SubscriberKey, m.EmailAddress, s.JobID, j.EmailName
                    FROM [Newsletter Master] m
                    INNER JOIN _Sent s ON s.SubscriberKey = m.SubscriberKey
                    INNER JOIN _Job j ON j.JobID = s.JobID
                    WHERE m.OptIn = 1`,
                expected: ['Newsletter Master'],
            },
            {
                title: 'exclusion with LEFT JOIN and IS NULL',
                sql: `
                    SELECT c.ContactKey, c.Email
                    FROM Campaign_Audience c
                    LEFT JOIN Campaign_Exclusions e ON e.ContactKey = c.ContactKey
                    LEFT JOIN ENT.Global_Unsubscribes u ON u.SubscriberKey = c.ContactKey
                    WHERE e.ContactKey IS NULL AND u.SubscriberKey IS NULL`,
                expected: ['Campaign_Audience', 'Campaign_Exclusions', 'ENT.Global_Unsubscribes'],
            },
            {
                title: 'deduplication with ROW_NUMBER in a derived table',
                sql: `
                    SELECT x.ContactKey, x.Email
                    FROM (
                        SELECT ContactKey, Email,
                            ROW_NUMBER() OVER (PARTITION BY ContactKey ORDER BY ModifiedDate DESC) AS rn
                        FROM Import_Staging
                    ) x
                    WHERE x.rn = 1`,
                expected: ['Import_Staging'],
            },
            {
                title: 'NOT EXISTS and IN subqueries',
                sql: `
                    SELECT a.SubscriberKey
                    FROM Loyalty_Members a
                    WHERE NOT EXISTS (SELECT 1 FROM Loyalty_Churned b WHERE b.SubscriberKey = a.SubscriberKey)
                    AND a.Tier IN (SELECT Tier FROM Loyalty_Tier_Config WHERE Active = 1)`,
                expected: ['Loyalty_Members', 'Loyalty_Churned', 'Loyalty_Tier_Config'],
            },
            {
                title: 'UNION of two sources',
                sql: `
                    SELECT Email, 'web' AS Source FROM Web_Signups
                    UNION
                    SELECT Email, 'store' AS Source FROM Store_Signups WHERE Email LIKE '%@%'`,
                expected: ['Web_Signups', 'Store_Signups'],
            },
            {
                title: 'CTE with aggregation',
                sql: `
                    WITH purchases AS (
                        SELECT ContactKey, SUM(Amount) AS Total
                        FROM Order_Lines
                        GROUP BY ContactKey
                    )
                    SELECT p.ContactKey, p.Total, c.FirstName
                    FROM purchases p
                    JOIN Contacts_Master c ON c.ContactKey = p.ContactKey`,
                expected: ['Order_Lines', 'Contacts_Master'],
            },
            {
                title: 'OUTER APPLY for the latest record',
                sql: `
                    SELECT c.ContactKey, last.ProductId
                    FROM Contacts_Master c
                    OUTER APPLY (
                        SELECT TOP 1 v.ProductId FROM Product_Views v
                        WHERE v.ContactKey = c.ContactKey ORDER BY v.ViewDate DESC
                    ) last`,
                expected: ['Contacts_Master', 'Product_Views'],
            },
            {
                title: 'synchronized Salesforce objects',
                sql: `
                    SELECT c.Id AS ContactKey, a.Name AS AccountName
                    FROM Contact_Salesforce c
                    JOIN Account_Salesforce a ON a.Id = c.AccountId
                    WHERE c.HasOptedOutOfEmail = 0`,
                expected: ['Contact_Salesforce', 'Account_Salesforce'],
            },
            {
                title: 'journey and bounce data views',
                sql: `
                    SELECT j.JourneyName, COUNT(b.SubscriberKey) AS Bounces
                    FROM _Journey j
                    JOIN _JourneyActivity ja ON ja.VersionID = j.VersionID
                    JOIN _Bounce b ON b.TriggererSendDefinitionObjectID = ja.JourneyActivityObjectID
                    GROUP BY j.JourneyName`,
                expected: [],
            },
            {
                title: 'commented out join and string with SQL inside',
                sql: `
                    SELECT s.SubscriberKey, 'see FROM Old_Table' AS Note
                    FROM Survey_Answers s
                    -- LEFT JOIN Survey_Old o ON o.SubscriberKey = s.SubscriberKey
                    /* JOIN Survey_Test t ON 1=1 */
                    WHERE s.Answer <> ''`,
                expected: ['Survey_Answers'],
            },
            {
                title: 'comma join with brackets and aliases without AS',
                sql: `
                    SELECT a.Email
                    FROM [Event Registrations] a, [Event Sessions] b
                    WHERE a.SessionId = b.Id AND b.StartDate >= CONVERT(DATE, GETDATE())`,
                expected: ['Event Registrations', 'Event Sessions'],
            },
            {
                title: 'string functions with FROM keyword',
                sql: `
                    SELECT TRIM(' ' FROM r.Email) AS Email, SUBSTRING(r.Zip, 1, 3) AS Region
                    FROM Raw_Imports r`,
                expected: ['Raw_Imports'],
            },
            {
                title: 'lower case keywords and table hint',
                sql: `
                    select top 100 percent d.subscriberkey
                    from Daily_Delta d with (nolock)
                    left outer join Daily_Delta_Archive x on x.subscriberkey = d.subscriberkey
                    where x.subscriberkey is null`,
                expected: ['Daily_Delta', 'Daily_Delta_Archive'],
            },
            {
                title: 'local and shared DE with the same name',
                sql: `
                    SELECT l.SubscriberKey
                    FROM Preferences l
                    FULL OUTER JOIN ENT.Preferences g ON g.SubscriberKey = l.SubscriberKey`,
                expected: ['Preferences', 'ENT.Preferences'],
            },
        ];

        for (const item of corpus) {
            it(item.title, () => {
                const result = parseSourceTables(item.sql);
                assert.deepEqual(
                    result.tables.map((table) => (table.isEnt ? 'ENT.' : '') + table.name),
                    item.expected
                );
                assert.deepEqual(result.skipped, [], 'realistic queries should be fully readable');
            });
        }
    });
});
