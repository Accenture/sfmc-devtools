SELECT
    SubscriberKey AS testField
FROM
    _Subscribers
WHERE
    country IN ({{{countryCodeIn}}})
