import { EmptyStr } from "@src/static/string";

export function decodeJwt<T = {}>(token: string) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split(EmptyStr)
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(EmptyStr)
  );

  return JSON.parse(jsonPayload) as T;
}
