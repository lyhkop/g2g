import { endsWith } from "lodash-es";

export function addTrailingSlash(url: string) {
  if (endsWith(url, "/")) {
    return url;
  }
  return `${url}/`;
}

export function removeTrailingSlash(url: string) {
  if (endsWith(url, "/")) {
    return url.slice(0, -1);
  }
  return url;
}
