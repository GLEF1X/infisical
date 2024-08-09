/**
 * Pick a list of properties from an object
 * into a new object
 */
export const pick = <T extends object, TKeys extends keyof T>(obj: T, keys: TKeys[]): Pick<T, TKeys> => {
  if (!obj) return {} as Pick<T, TKeys>;
  return keys.reduce(
    (acc, key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, TKeys>
  );
};

/**
 * Removes (shakes out) undefined entries from an
 * object. Optional second argument shakes out values
 * by custom evaluation.
 */
export const shake = <RemovedKeys extends string, T = object>(
  obj: T,
  filter: (value: unknown) => boolean = (x) => x === undefined || x === null
): Omit<T, RemovedKeys> => {
  if (!obj) return {} as T;
  const keys = Object.keys(obj) as (keyof T)[];
  return keys.reduce((acc, key) => {
    if (filter(obj[key])) {
      return acc;
    }
    acc[key] = obj[key];
    return acc;
  }, {} as T);
};

/**
 * Omit properties from an object based on a predicate function.
 *
 * The `omitBy` function creates a new object composed of properties from the input
 * object `obj` that do not satisfy the `predicate` function. The `predicate` is
 * invoked for each property of `obj` with the value and the key as arguments.
 *
 * @example
 * const obj = { a: 1, b: 'hello', c: 3, d: null };
 * const result = omitBy(obj, (value, key) => typeof value === 'string' || value === null);
 * // result: { a: 1, c: 3 }
 */
export const omitBy = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> => {
  return Object.keys(obj).reduce((res, key) => {
    const typedKey = key as keyof T;
    if (!predicate(obj[typedKey], typedKey)) {
      res[typedKey] = obj[typedKey];
    }
    return res;
  }, {} as Partial<T>);
};
