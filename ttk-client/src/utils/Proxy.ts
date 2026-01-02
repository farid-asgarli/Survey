/**
 * Removes any Proxy effects from an object by serializing it to JSON and parsing it back.
 * It effectively creates a deep clone of the object, which won't have any of the traps or
 * handlers of the original Proxy.
 *
 * Note: It will also lose functions, dates or other non-serializable data types.
 *
 * @template T The type of the input object.
 *
 * @param {T} obj - The Proxy object to de-proxify.
 *
 * @returns {T} A deep clone of the input object with all Proxy effects removed.
 */
export function DeProxify<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Log method for DeProxify. Removes any Proxy effects from an object and logs the result.
 *
 * @param {any} obj - The Proxy object to de-proxify and log.
 */
DeProxify.log = (obj: any) => {
  if (obj !== undefined) console.log(DeProxify(obj));
};

/**
 * Creates a Proxy for a given React Ref object. The Proxy allows calling methods
 * on the current object referenced by the Ref. This is especially useful when the
 * reference object changes over time (e.g., due to asynchronous loading).
 *
 * @template TRef The type of the reference object.
 *
 * @param {React.MutableRefObject<TRef | null>} refObject - The React Ref object for which the Proxy is created.
 *
 * @returns {TRef} A Proxy for the provided Ref object. It enables calling methods on the current object
 *                  of the Ref. If the method doesn't exist or the current object is null, it will fail silently.
 */
export function Proxify<TRef extends {}>(refObject: React.MutableRefObject<TRef | null>): TRef {
  return new Proxy(
    {},
    {
      get: function (_, prop) {
        if (typeof refObject.current?.[prop] === 'function') {
          return (...args: unknown[]) => {
            const method = refObject.current?.[prop] as (...args: unknown[]) => unknown;
            return method(...args);
          };
        }
      },
    }
  ) as TRef;
}
