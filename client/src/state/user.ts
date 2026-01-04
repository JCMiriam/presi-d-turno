import { reactive } from "vue";

/**
 * Identidad local del usuario (cliente)
 * Esto NO es el Player del server.
 */
export type UserProfile = {
  username: string;
  avatarId: number; // 0–41, coincide con avatar-XX.svg
};

/**
 * Estado global reactivo
 * Vive en memoria (se pierde al refresh, y está bien)
 */
export const userState = reactive<{
  user: UserProfile | null;
}>({
  user: null
});

/**
 * Crea / actualiza el usuario
 */
export function setUser(user: UserProfile) {
  userState.user = user;
}

/**
 * Limpia la identidad local
 * Útil para:
 * - volver atrás
 * - errores de conexión
 * - expulsión de sala
 */
export function clearUser() {
  userState.user = null;
}

/**
 * Helper: ¿hay usuario creado?
 */
export function hasUser(): boolean {
  return userState.user !== null;
}

/**
 * Helper: obtiene el usuario o lanza error
 * Útil si quieres ser estricta en ciertas páginas
 */
export function requireUser(): UserProfile {
  if (!userState.user) {
    throw new Error("User not initialized");
  }
  return userState.user;
}
