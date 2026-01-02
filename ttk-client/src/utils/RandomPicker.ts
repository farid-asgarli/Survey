export function RandomPropertyPicker<K extends number | string | symbol, V>(obj: Record<K, V>, exclude?: (key: K) => boolean) {
  let keys = Object.keys(obj) as Array<K>;
  if (exclude) {
    keys = keys.filter(exclude);
  }
  return obj[keys[(keys.length * Math.random()) << 0] as K];
}
