## testExisting_dataExtension

**Description:** bla bla

**Folder:** Data Extensions/

**Fields in table:** 6

**Sendable:** Yes (`ContactKey` to `Subscriber Key`)

**Testable:** Yes

**Retention Policy:** allRecords

- **Retention Period:** 6 Months
- **Reset Retention Period on import:** no

| Name | FieldType | MaxLength | IsPrimaryKey | IsNullable | DefaultValue |
| --- | --- | --- | --- | --- | --- |
| FirstName | Text | 50 | - | + |  |
| LastName | Text | 50 | - | + |  |
| EmailAddress | EmailAddress | 254 | - | - |  |
| ContactKey | Text | 50 | + | - |  |
| decimalField | Decimal | 6,3 | - | - |  |
| numberField | Number |  | - | - |  |
