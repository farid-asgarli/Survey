import { EmptyStr } from '@src/static/string';
import { applyTimeZoneOffset } from './dateFormat';

export function jsonToFormData(data: any, formData?: FormData, parentKey?: string) {
  if (formData === undefined) formData = new FormData();
  if (parentKey === undefined) parentKey = EmptyStr;
  const generateSubKey = (key: string) => (!isNaN(+key) ? '[' + key + ']' : '.' + key);

  if (data instanceof File) formData.append(parentKey, data);
  else if (typeof data === 'object' && data !== null) {
    for (var key in data)
      if (data.hasOwnProperty(key)) {
        var formKey = parentKey ? parentKey + generateSubKey(key) : key;
        jsonToFormData(data[key], formData, formKey);
      }
  } else if (Array.isArray(data))
    for (var i = 0; i < data.length; i++) {
      const formKey = parentKey ? parentKey + '[' + i + ']' : i;
      jsonToFormData(data[i], formData, formKey.toString());
    }
  else formData.append(parentKey, data);

  return formData;
}

export function parseDateFormEntries(values: any) {
  for (const key in values) {
    const element = values[key];
    if (typeof element === 'object' && !isNaN(new Date(element).getTime())) values[key] = applyTimeZoneOffset(values[key]);
  }
  return values;
}

export function clearEmptyFields(values: any) {
  if (typeof values === 'object') {
    const valuesToRemove: typeof values = {};
    for (const key in values) {
      const fieldValue = values[key];
      if (fieldValue || fieldValue === 0) valuesToRemove[key] = fieldValue;
    }
    return valuesToRemove;
  }
  return values;
}
