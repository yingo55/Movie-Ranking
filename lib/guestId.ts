// A random id stored in localStorage so a guest can be recognized on
// repeat visits from the same browser, without any account or login.
// Clearing browser storage resets it -- that's an accepted tradeoff for
// keeping this account-free.
export function getGuestId(): string {
  const key = 'guest_id';
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}
