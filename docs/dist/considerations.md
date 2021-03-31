# Metadata Type findings & considerations

## Automation

API: SOAP / REST

## Campaign

API: SOAP

Child Metadata:

-   [CampaignAsset](#CampaignAsset)

## CampaignAsset

API: SOAP

## DataExtension

API: SOAP

Child Metadata:

-   [DataExtensionField](#DataExtensionField)

Considerations:

-   **"SendableSubscriberField": { "Name": "\_SubscriberKey" }** is part of a DataExtension while retrieving, but a DataExtension cannot be created/updated with this property. **\_SubscriberKey** must be replaced with **Subscriber Key** before creating/updating
-   The referenced **CategoryID** represents the folder in which the DataExtension is located. these IDs are auto generated and therefore differ between BUs. When a DataExtension is deployed between BUs, the **CategoryID**s must be mapped between source and target

## DataExtensionField

API: SOAP

Considerations:

-   DataExtensionFields can only be created or updated
-   Instead of using the **CustomerKey** for updates like other metadata types, it uses the **ObjectID** which is auto generated and therefore different in each BU. ObjectIDs must be mapped between source and target if they are deployed between BUs
-   Some properties cannot be updated, but are also not throwing an error when they are part of the request (e.g. **Scale**)

## Email

API: SOAP

## Folder

API: SOAP

Child Metadata:

-   [DataExtension](#DataExtension)
-   [Automation](#Automation)

Considerations:

-   Folders are identified by their **ID** instead of their **CustomerKey**, this **ID** is auto generated and therefore different in each BU.
-   **CustomerKey** field can be empty and the **Name** only needs to be unique inside a sub-folder. A unique identifier can be created by building the complete path of a folder (e.g. **/grandparent/parent/folder**). Such a unique identifier can be used to map Folder **ID**s between BUs. This kind of mapping does not support moving folders into other subfolders, because the unique identifier would then change

## List

API: SOAP

## Query

API: SOAP
