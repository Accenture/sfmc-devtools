const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const SDK = require('../lib');
exports.mock = new MockAdapter(axios, { onNoMatch: 'throwException' });
exports.defaultSdk = () => {
    return new SDK(
        {
            client_id: 'XXXXX',
            client_secret: 'YYYYYY',
            auth_url: 'https://mct0l7nxfq2r988t1kxfy8sc47ma.auth.marketingcloudapis.com/',
            account_id: 1111111,
            scope: [
                'offline',
                'documents_and_images_read',
                'documents_and_images_write',
                'saved_content_read',
                'saved_content_write',
                'automations_execute',
                'automations_read',
                'automations_write',
                'journeys_execute',
                'journeys_read',
                'journeys_write',
                'email_read',
                'email_send',
                'email_write',
                'push_read',
                'push_send',
                'push_write',
                'sms_read',
                'sms_send',
                'sms_write',
                'social_post',
                'social_publish',
                'social_read',
                'social_write',
                'web_publish',
                'web_read',
                'web_write',
                'audiences_read',
                'audiences_write',
                'list_and_subscribers_read',
                'list_and_subscribers_write',
                'data_extensions_read',
                'data_extensions_write',
                'file_locations_read',
                'file_locations_write',
                'tracking_events_read',
                'calendar_read',
                'calendar_write',
                'campaign_read',
                'campaign_write',
                'accounts_read',
                'accounts_write',
                'users_read',
                'users_write',
                'webhooks_read',
                'webhooks_write',
                'workflows_write',
                'approvals_write',
                'tags_write',
                'approvals_read',
                'tags_read',
                'workflows_read',
                'ott_chat_messaging_read',
                'ott_chat_messaging_send',
                'ott_channels_read',
                'ott_channels_write',
                'marketing_cloud_connect_read',
                'marketing_cloud_connect_write',
                'marketing_cloud_connect_send',
                'event_notification_callback_create',
                'event_notification_callback_read',
                'event_notification_callback_update',
                'event_notification_callback_delete',
                'event_notification_subscription_create',
                'event_notification_subscription_read',
                'event_notification_subscription_update',
                'event_notification_subscription_delete',
                'tracking_events_write',
                'key_manage_view',
                'key_manage_rotate',
                'key_manage_revoke',
                'dfu_configure',
                'journeys_aspr',
                'journeys_delete',
                'package_manager_package',
                'package_manager_deploy',
                'deep_linking_asset_read',
                'deep_linking_asset_write',
                'deep_linking_asset_delete',
                'deep_linking_settings_read',
                'deep_linking_settings_write',
            ],
        },
        {
            eventHandlers: {
                logRequest: () => {
                    return;
                },

                logResponse: () => {
                    return;
                },
                onConnectionError: () => {
                    return;
                },
                onRefresh: () => {
                    return;
                },
                onLoop: () => {
                    return;
                },
            },
            retryOnConnectionError: true,
            requestAttempts: 2,
        }
    );
};
