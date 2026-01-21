// Quick verification that the exports exist
import {
    CustomField,
    CustomFieldType,
    CreateCustomFieldDto,
    UpdateCustomFieldDto,
    FieldOption
} from './src/types/CustomField.ts';

console.log('✓ All exports found successfully!');
console.log('- CustomField:', typeof CustomField);
console.log('- CustomFieldType:', typeof CustomFieldType);
console.log('- CreateCustomFieldDto:', typeof CreateCustomFieldDto);
console.log('- UpdateCustomFieldDto:', typeof UpdateCustomFieldDto);
console.log('- FieldOption:', typeof FieldOption);
