## testExisting_dataExtensionShared

**Description:** bla bla

**Folder:** Shared Items/Shared Data Extensions/

**Fields in table:** 4

**Sendable:** Yes (`ContactKey` to `Subscriber Key`)

**Testable:** Yes

**Retention Policy:** individialRecords

- **Retention Period:** 6 Months
- **Reset Retention Period on import:** no

| Name | FieldType | MaxLength | IsPrimaryKey | IsNullable | DefaultValue |
| --- | --- | --- | --- | --- | --- |
| FirstName | Text | 50 | - | + |  |
| LastName | Text | 50 | - | + |  |
| EmailAddress | EmailAddress | 254 | - | - |  |
| ContactKey | Text | 50 | + | - |  |
