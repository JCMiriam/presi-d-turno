<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { socket } from "./socket";
import { SOCKET_EVENTS, type RoomStatePayload } from "@pdt/shared";

const roomId = ref("demo");
const username = ref("Dubu");
const avatarId = ref("1");
const players = ref<RoomStatePayload["players"]>([]);

function join() {
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomId: roomId.value,
    username: username.value,
    avatarId: avatarId.value
  });
}

onMounted(() => {
  socket.on(SOCKET_EVENTS.ROOM_STATE, (state: RoomStatePayload) => {
    players.value = state.players;
  });
});

onBeforeUnmount(() => {
  socket.off(SOCKET_EVENTS.ROOM_STATE);
});
</script>

<template>
  <div style="padding: 24px; font-family: system-ui;">
    <h1>Presi d Turno (demo sockets)</h1>

    <div style="display:flex; gap:8px; margin:12px 0;">
      <input v-model="roomId" placeholder="roomId" />
      <input v-model="username" placeholder="username" />
      <input v-model="avatarId" placeholder="avatarId" />
      <button @click="join">Join</button>
    </div>

    <h2>Players</h2>
    <ul>
      <li v-for="p in players" :key="p.id">{{ p.username }} (avatar {{ p.avatarId }})</li>
    </ul>
  </div>
</template>
