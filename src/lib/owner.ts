const KEY = "qr-studio:owner";

/**
 * A stable anonymous id for this browser, used to scope which links show in
 * "history". Links remain publicly resolvable by code regardless of owner.
 */
export function getOwnerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
