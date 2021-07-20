import store from "@/store";

export default async function authFetch(input: RequestInfo, init?: RequestInit) {
  init = init || {};

  const authString = store.state.basicAuthString;
  if (!authString) return fetch(input, init);

  if (!init.headers) {
    init.headers = [['Authorization', authString]];
  } else {
    const newHeaders = new Headers(init.headers);
    newHeaders.append('Authorization', authString);

    init.headers = newHeaders;
  }

  return fetch(input, init);
}