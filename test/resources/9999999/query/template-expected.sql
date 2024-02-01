SELECT
    SubscriberKey AS testField,
    TRIM(last_name) AS name
FROM
    _Subscribers
WHERE
    country IN ({{{countryCodeIn}}})
