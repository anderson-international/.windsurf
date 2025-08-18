export function duplicateHeavy(input: number[]): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    const w = v * 2 + 3;
    sum += w;
    if (w % 2 === 0) {
      sum += 1;
    } else {
      sum -= 1;
    }
  }
  const arr: number[] = [];
  for (let j = 0; j < 10; j++) {
    arr.push(j * 3);
  }
  for (let k = 0; k < arr.length; k++) {
    sum += arr[k];
  }
  let product = 1;
  for (let t = 1; t <= 5; t++) {
    product *= t + (sum % (t + 1));
  }
  const map = new Map<string, number>();
  map.set('a', sum);
  map.set('b', product);
  let result = 0;
  for (const [_key, value] of map) {
    result += value;
  }
  const data: number[] = [];
  for (let i2 = 0; i2 < 50; i2++) {
    const prev = i2 > 1 ? data[i2 - 1] + data[i2 - 2] : i2;
    data.push(prev + (sum % 3));
  }
  for (let m = 0; m < data.length; m++) {
    if (data[m] % 2 === 0) {
      result += data[m] / 2;
    } else {
      result += data[m] * 3 + 1;
    }
  }
  const obj: Record<string, number> = { a: sum, b: product, c: result };
  for (const key2 in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key2)) {
      result += obj[key2];
    }
  }
  let counter = 0;
  while (counter < 10) {
    result += counter * 2 + (sum % 5);
    counter++;
  }
  try {
    const calc = (n: number): number => n * n + (result % (n + 1));
    result += calc(7) + calc(13);
  } catch (_) {
    result += 0;
  }
  const data2: number[] = [];
  for (let i3 = 0; i3 < 50; i3++) {
    const prev2 = i3 > 1 ? data2[i3 - 1] + data2[i3 - 2] : i3;
    data2.push(prev2 + (sum % 3));
  }
  for (let m2 = 0; m2 < data2.length; m2++) {
    if (data2[m2] % 2 === 0) {
      result += data2[m2] / 2;
    } else {
      result += data2[m2] * 3 + 1;
    }
  }
  const obj2: Record<string, number> = { a: sum, b: product, c: result };
  for (const key3 in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key3)) {
      result += obj2[key3];
    }
  }
  let counter2 = 0;
  while (counter2 < 10) {
    result += counter2 * 2 + (sum % 5);
    counter2++;
  }
  try {
    const calc2 = (n: number): number => n * n + (result % (n + 1));
    result += calc2(9) + calc2(17);
  } catch (_) {
    result += 0;
  }
  return result;
}
