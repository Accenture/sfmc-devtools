SELECT
    SubscriberKey AS testField,
    TRIM(last_name) AS name
FROM
    testExisting_dataExtensionShared
WHERE
    country IN ('test')
