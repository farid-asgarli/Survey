import { EmptyStr } from "@src/static/string";
import Environment from "../static/env";

/**
 * Appends prefix to class name.
 * @param arg1 Prefix string to append at front.
 * @returns Function that concatenates the given string with the prefix, using hyphen.
 */
export const pfx =
  (arg1: string) =>
  /**
   *
   * @param arg2 Sub-class name.
   * @returns Joint class name.
   */
  (arg2?: string) =>
    Environment.CLS_PREFIX + arg1 + (arg2 ? "-" + arg2 : EmptyStr);
