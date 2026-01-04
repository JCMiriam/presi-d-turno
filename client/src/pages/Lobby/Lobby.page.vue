<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { socket } from "@socket";
import { SOCKET_EVENTS, type RoomState, type JoinRoomPayload } from "@shared";

import { userState, clearUser } from "../../state/index";
import { useRoomStore } from "@stores/room";

import { ref } from "vue";

const inviteStatus = ref<"idle" | "copied" | "error">("idle");

const inviteUrl = computed(() => {
  // Usamos el roomId "real" si ya llegó del server; si no, el de la query/fallback
  const id = roomStore.roomId ?? roomId.value;

  // Base URL del front actual (en Render será https://xxxx.onrender.com)
  const base = window.location.origin;

  // Queremos que el invitado caiga en CreateUser con ?roomId=...
  // (asumiendo que CreateUser está en "/")
  return `${base}/?roomId=${encodeURIComponent(id)}`;
});

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteUrl.value);
    inviteStatus.value = "copied";
    window.setTimeout(() => (inviteStatus.value = "idle"), 1500);
  } catch {
    // Fallback por si clipboard API falla (algunos navegadores / contextos)
    try {
      const ta = document.createElement("textarea");
      ta.value = inviteUrl.value;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      inviteStatus.value = "copied";
      window.setTimeout(() => (inviteStatus.value = "idle"), 1500);
    } catch {
      inviteStatus.value = "error";
      window.setTimeout(() => (inviteStatus.value = "idle"), 2000);
    }
  }
}


/**
 * Routing
 */
const route = useRoute();
const router = useRouter();

/**
 * Store
 */
const roomStore = useRoomStore();

/**
 * Query params
 * - roomId: si vienes por enlace de invitación
 * - mode: "join" o "create"
 */
const mode = computed<"join" | "create">(() => {
  const m = route.query.mode;
  return m === "join" ? "join" : "create";
});

const roomId = computed<string>(() => {
  const r = route.query.roomId;
  // Para development, ponemos un fallback estable.
  // En create real, el server generará un id y nos lo devolverá.
  return typeof r === "string" && r.trim() ? r.trim() : "demo";
});

/**
 * Helpers
 */
function avatarSrc(id: number): string {
  const padded = id.toString().padStart(2, "0");
  return `/src/assets/images/avatars/avatar-${padded}.svg`;
}

function backToCreateUser() {
  const currentRoomId = typeof route.query.roomId === "string" ? route.query.roomId : undefined;
  clearUser();
  roomStore.reset();

  router.replace({
    name: "user-setup",
    query: currentRoomId ? { roomId: currentRoomId } : {}
  });
}

/**
 * Socket wiring
 */
function handleRoomState(snapshot: RoomState) {
  roomStore.applySnapshot(snapshot);
}

function joinRoom() {
  if (!userState.user) return;

  const payload: JoinRoomPayload = {
    roomId: roomId.value,
    username: userState.user.username,
    avatarId: userState.user.avatarId
  };

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload);
}

onMounted(() => {
  // Guard: si no hay usuario creado, no puedes estar en lobby
  if (!userState.user) {
    router.replace({ name: "user-setup", query: route.query.roomId ? { roomId: String(route.query.roomId) } : {} });
    return;
  }

  // Listeners
  socket.on(SOCKET_EVENTS.ROOM_STATE, handleRoomState);

  // Guardamos mi id cuando conecte, y hacemos join
  socket.on("connect", () => {
    // socket.id puede ser undefined momentáneamente, pero tras connect suele venir
    if (socket.id) roomStore.setMyId(socket.id);
    joinRoom();
  });

  // Si ya estaba conectada (navegación interna), haz join directamente
  if (socket.connected) {
    if (socket.id) roomStore.setMyId(socket.id);
    joinRoom();
  }
});

onBeforeUnmount(() => {
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState);
  socket.off("connect");
});
</script>

<template>
  <main class="lobby">
    <header class="header">
      <div>
        <h1>Lobby</h1>
        <p class="sub">
          Modo: <strong>{{ mode }}</strong> · Sala: <strong>{{ roomStore.roomId ?? roomId }}</strong> · v{{ roomStore.version }}
        </p>
      </div>

      <button class="ghost" type="button" @click="backToCreateUser">
        Volver
      </button>
    </header>

    <div class="header-actions">
        <button class="ghost" type="button" @click="copyInviteLink">
            {{ inviteStatus === "copied"
            ? "¡Copiado! ✅"
            : inviteStatus === "error"
                ? "No se pudo copiar 😅"
                : "Invitar jugadores"
            }}
        </button>

        <button class="ghost" type="button" @click="backToCreateUser">
            Volver
        </button>
    </div>


    <section class="card">
      <h2 class="card-title">Tu usuario</h2>

      <div v-if="userState.user" class="me">
        <img class="avatar-img" :src="avatarSrc(userState.user.avatarId)" :alt="`Avatar ${userState.user.avatarId}`" />
        <div>
          <div class="me-name">{{ userState.user.username }}</div>
          <div class="me-meta">Avatar #{{ userState.user.avatarId }}</div>
        </div>
      </div>

      <p v-else class="warn">No hay usuario en memoria.</p>
    </section>

    <section class="card">
      <h2 class="card-title">Jugadores ({{ roomStore.players.length }})</h2>

      <ul class="players">
        <li v-for="p in roomStore.players" :key="p.id" class="player">
          <img class="avatar-img" :src="avatarSrc(p.avatarId)" :alt="`Avatar ${p.avatarId}`" />

          <div class="player-main">
            <div class="player-top">
              <span class="player-name">
                {{ p.username }}
                <span v-if="p.id === roomStore.myId" class="tag you">tú</span>
              </span>

              <span class="player-points">{{ p.points }} pts</span>
            </div>

            <div class="player-tags">
              <span v-if="p.id === roomStore.hostId" class="tag">host</span>
              <span v-if="p.id === roomStore.presiId" class="tag presi">presi</span>
            </div>
          </div>
        </li>
      </ul>

      <p v-if="roomStore.players.length === 0" class="muted">
        Aún no hay jugadores en la sala (¿conectado?)
      </p>
    </section>
  </main>
</template>

<style scoped>
.lobby {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, sans-serif;
  color: #fff;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.sub {
  margin: 6px 0 0;
  opacity: 0.8;
}

.card {
  background: #111;
  border: 1px solid #444;
  border-radius: 14px;
  padding: 14px;
  margin-top: 14px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px;
}

.me {
  display: flex;
  align-items: center;
  gap: 12px;
}

.me-name {
  font-weight: 700;
}

.me-meta {
  font-size: 12px;
  opacity: 0.8;
}

.players {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #333;
  background: #0d0d0d;
}

.player-main {
  flex: 1;
}

.player-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.player-name {
  font-weight: 600;
}

.player-points {
  opacity: 0.85;
  font-size: 13px;
}

.player-tags {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 10px;
  background: #0b0b0b;
  border: 1px solid #333;
  padding: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #444;
  opacity: 0.9;
}

.tag.you {
  margin-left: 8px;
  border-color: #7c3aed;
}

.tag.presi {
  border-color: #22c55e;
}

.ghost {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #444;
  background: #111;
  color: #fff;
  cursor: pointer;
}

.warn {
  color: #ff6b6b;
  margin: 0;
}

.muted {
  opacity: 0.7;
  margin-top: 10px;
}
</style>
