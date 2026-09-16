import { USERS } from './users.js';

export function login(username, password) {
  if (!USERS[username]) {
    return { success: false, message: '[✗] USERNAME TIDAK DITEMUKAN' };
  }

  if (USERS[username] !== password) {
    return { success: false, message: '[✗] PASSWORD SALAH' };
  }

  return { success: true, message: '[✓] ACCESS GRANTED' };
}
