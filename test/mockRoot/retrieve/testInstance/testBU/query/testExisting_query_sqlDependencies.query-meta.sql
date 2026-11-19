-- FROM testCommented_dataExtension
SELECT
    de.ContactKey AS testField,
    'JOIN testString_dataExtension' AS note
FROM
    testExisting_dataExtension de
    INNER JOIN _Subscribers s ON s.SubscriberKey = de.ContactKey
    LEFT JOIN [TESTEXISTING_DATAEXTENSION_EXCLUSION] ex ON ex.ContactKey = de.ContactKey
    LEFT JOIN ENT.testExisting_dataExtensionShared sh ON sh.ContactKey = de.ContactKey
    LEFT JOIN testMissing_dataExtension m ON m.ContactKey = de.ContactKey
WHERE
    ex.ContactKey IS NULL
