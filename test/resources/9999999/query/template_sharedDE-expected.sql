SELECT
    SubscriberKey AS testField,
    TRIM(last_name) AS name
FROM
    {{{prefix}}}dataExtensionShared
WHERE
    country IN ({{{countryCodeIn}}})
