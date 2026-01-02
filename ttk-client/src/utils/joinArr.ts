export function joinObjectsWithElement<T, V>(arr: T[], element: V): (T | V)[] {
  let result: (T | V)[] = [];
  arr.forEach((item, index) => {
    result.push(item);
    if (index !== arr.length - 1) {
      result.push(element);
    }
  });
  return result;
}
