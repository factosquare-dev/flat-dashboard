import {
  // String utilities
  capitalize,
  capitalizeWords,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  normalizeWhitespace,
  
  // Type guards
  isDefined,
  isNullOrUndefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isEmpty,
  
  // Object utilities
  deepClone,
  deepMerge,
  pick,
  omit,
  get,
  set,
  
  // Color utilities
  getColorFromString,
  hexToRgb,
  rgbToHex,
  isDarkColor,
  
  // Async utilities
  sleep,
  retry,
  timeout,
  
  // Math utilities
  clamp,
  round,
  percentage,
  randomBetween,
  
  // Browser utilities
  generateId,
  slugify,
} from '@/common';

describe('Common Utilities', () => {
  describe('String utilities', () => {
    test('capitalize', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('')).toBe('');
      expect(capitalize('a')).toBe('A');
    });

    test('capitalizeWords', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');
      expect(capitalizeWords('')).toBe('');
    });

    test('toCamelCase', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('Hello World')).toBe('helloWorld');
      expect(toCamelCase('hello')).toBe('hello');
    });

    test('toPascalCase', () => {
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
      expect(toPascalCase('hello_world')).toBe('HelloWorld');
      expect(toPascalCase('hello world')).toBe('HelloWorld');
      expect(toPascalCase('hello')).toBe('Hello');
    });

    test('toKebabCase', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });

    test('toSnakeCase', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('HelloWorld')).toBe('hello_world');
      expect(toSnakeCase('hello world')).toBe('hello_world');
      expect(toSnakeCase('hello-world')).toBe('hello_world');
    });

    test('normalizeWhitespace', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
      expect(normalizeWhitespace('hello\n\tworld')).toBe('hello world');
      expect(normalizeWhitespace('')).toBe('');
    });
  });

  describe('Type guards', () => {
    test('isDefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
    });

    test('isNullOrUndefined', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined('')).toBe(false);
    });

    test('isString', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
    });

    test('isNumber', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);
    });

    test('isBoolean', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });

    test('isArray', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
    });

    test('isObject', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(new Date())).toBe(false);
    });

    test('isFunction', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction('function')).toBe(false);
    });

    test('isEmpty', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('  ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('Object utilities', () => {
    test('deepClone', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2023-01-01'),
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
      expect(cloned.e).not.toBe(original.e);
      expect(cloned.e.getTime()).toBe(original.e.getTime());
    });

    test('deepMerge', () => {
      const target = { a: 1, b: { c: 2 } };
      const source1 = { b: { d: 3 }, e: 4 };
      const source2 = { b: { c: 5 }, f: 6 };
      
      const result = deepMerge(target, source1, source2);
      
      expect(result).toEqual({
        a: 1,
        b: { c: 5, d: 3 },
        e: 4,
        f: 6,
      });
    });

    test('pick', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
      expect(pick(obj, [])).toEqual({});
    });

    test('omit', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(omit(obj, ['b', 'd'])).toEqual({ a: 1, c: 3 });
      expect(omit(obj, [])).toEqual(obj);
    });

    test('get', () => {
      const obj = { a: { b: { c: 123 } } };
      expect(get(obj, 'a.b.c')).toBe(123);
      expect(get(obj, 'a.b.d', 'default')).toBe('default');
      expect(get(obj, 'x.y.z')).toBeUndefined();
      expect(get(null, 'a.b', 'default')).toBe('default');
    });

    test('set', () => {
      const obj = { a: { b: 1 } };
      set(obj, 'a.b', 2);
      expect(obj.a.b).toBe(2);
      
      set(obj, 'a.c.d', 3);
      expect(obj.a.c.d).toBe(3);
    });
  });

  describe('Color utilities', () => {
    test('getColorFromString', () => {
      const color1 = getColorFromString('user1');
      const color2 = getColorFromString('user2');
      const color3 = getColorFromString('user1'); // Same as color1
      
      expect(color1).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
      expect(color1).not.toBe(color2);
      expect(color1).toBe(color3);
    });

    test('hexToRgb', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 }); // Without #
      expect(hexToRgb('invalid')).toBeNull();
    });

    test('rgbToHex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(15, 15, 15)).toBe('#0f0f0f');
    });

    test('isDarkColor', () => {
      expect(isDarkColor('#000000')).toBe(true);
      expect(isDarkColor('#333333')).toBe(true);
      expect(isDarkColor('#FFFFFF')).toBe(false);
      expect(isDarkColor('#CCCCCC')).toBe(false);
    });
  });

  describe('Async utilities', () => {
    test('sleep', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small timing variance
      expect(elapsed).toBeLessThan(150);
    });

    test('retry - success', async () => {
      let attempts = 0;
      const fn = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      const result = await retry(fn, { delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('retry - max attempts exceeded', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Always fails');
      });

      await expect(retry(fn, { maxAttempts: 2, delay: 10 })).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('timeout - success', async () => {
      const promise = sleep(50).then(() => 'success');
      const result = await timeout(promise, 100);
      expect(result).toBe('success');
    });

    test('timeout - timeout exceeded', async () => {
      const promise = sleep(100).then(() => 'success');
      await expect(timeout(promise, 50)).rejects.toThrow('Timeout after 50ms');
    });
  });

  describe('Math utilities', () => {
    test('clamp', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test('round', () => {
      expect(round(3.14159)).toBe(3);
      expect(round(3.14159, 2)).toBe(3.14);
      expect(round(3.14159, 4)).toBe(3.1416);
    });

    test('percentage', () => {
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(1, 3, 2)).toBe(33.33);
      expect(percentage(0, 0)).toBe(0);
    });

    test('randomBetween', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomBetween(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('Browser utilities', () => {
    test('generateId', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId('user');
      
      expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
      expect(id3).toMatch(/^user-[a-z0-9]+-[a-z0-9]+$/);
    });

    test('slugify', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('  Hello   World!  ')).toBe('hello-world');
      expect(slugify('Hello_World-123')).toBe('hello-world-123');
      expect(slugify('Special@#$Characters')).toBe('special-characters');
    });
  });
});