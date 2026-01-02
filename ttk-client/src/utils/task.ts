/**
 * Artificially delays the task, and executes callback when finishes, if provided.
 * @param ms Delay in milliseconds.
 * @param cb Callback function to execute.
 * @returns {Promise<void | T>}
 */
export const sleep = <T>(ms: number = 1000, cb?: () => T): Promise<void | T> =>
  new Promise<T | void>((res) => setTimeout(() => res(cb?.()), ms));
