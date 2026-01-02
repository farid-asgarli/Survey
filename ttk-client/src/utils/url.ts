import { EmptyStr } from "@src/static/string";

export function queryParams(params: Record<string, any>): string {
  let urlParams = new URLSearchParams();

  for (const key in params) {
    const element = params[key];
    if (element) urlParams.append(key, element);
  }

  const queryString = urlParams.toString();
  return queryString ? "?" + queryString : EmptyStr;
}
