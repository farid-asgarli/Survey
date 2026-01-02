export function createOptionsDataPreserved<TKey extends keyof any, TValue>(obj: Record<TKey, TValue>) {
  const options: Array<{ label: TValue; value: TKey | number }> = [];

  for (const key in obj) {
    const originalKey = Object.keys(obj).find((k) => obj[k as TKey] === obj[key]);
    options.push({
      label: obj[key],
      value: originalKey !== undefined && !isNaN(Number(originalKey)) ? Number(originalKey) : key,
    });
  }

  return options;
}

export function createOptionsData<TKey extends keyof any, TValue>(obj: Record<TKey, TValue>) {
  const options: Array<{ label: TValue; value: string }> = [];

  for (const key in obj)
    options.push({
      label: obj[key],
      value: key,
    });

  return options;
}

export function createNumericOptionsData<TValue>(obj: Record<number, TValue>) {
  const options: Array<{ label: TValue; value: number }> = [];

  for (const key in obj)
    options.push({
      label: obj[key],
      value: +key,
    });

  return options;
}

export function createEnumOptionsData<T extends Record<string, number | string>>(enumObj: T): Array<{ label: string; value: number }> {
  const options: Array<{ label: string; value: number }> = [];

  // Iterate over the entries of the enum and filter out numeric keys
  Object.entries(enumObj).forEach(([key, value]) => {
    if (!isNaN(Number(key))) return;

    options.push({
      label: key,
      value: value as number,
    });
  });

  return options;
}
