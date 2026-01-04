<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AvatarGallery, Button } from "@components/index";

import { setUser } from "../../state/index";

const route = useRoute();
const router = useRouter();

const roomIdFromQuery = computed(() => {
  const value = route.query.roomId;
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
});

const mode = computed<"create" | "join">(() =>
  roomIdFromQuery.value ? "join" : "create"
);

const submitLabel = computed(() =>
  mode.value === "join" ? "Unirse a la sala" : "Crear sala"
);

const username = ref("");
const selectedAvatarId = ref<number | null>(0);
const error = ref<string | null>(null);


function validate(): boolean {
  const name = username.value.trim();

  if (!name) {
    error.value = "Introduce un nombre de usuario.";
    return false;
  }

  if (name.length > 18) {
    error.value = "El nombre no puede tener más de 18 caracteres.";
    return false;
  }

  if (!selectedAvatarId.value) {
    error.value = "Selecciona un avatar.";
    return false;
  }

  error.value = null;
  return true;
}


function onSubmit() {
  if (!validate()) return;

  // Guardamos usuario en estado global
  setUser({
    username: username.value.trim(),
    avatarId: selectedAvatarId.value!
  });

  // Navegamos al lobby
  router.push({
    name: "lobby",
    query: {
      roomId: roomIdFromQuery.value ?? undefined,
      mode: mode.value
    }
  });
}
</script>

<template>
  <main class="create-user">
    <header class="header">
      <h1>Presi d Turno</h1>
      <p class="subtitle">
        {{ mode === "join"
          ? "Te estás uniendo a una sala existente"
          : "Crea una nueva sala para jugar"
        }}
      </p>
    </header>

    <Button
      icon="picture"
      icon-position="left"
      text="Guardar"
      variant="primary"
      appearance="solid"
      color="pure-white"
    ></Button>

    <form class="form" @submit.prevent="onSubmit">
      <!-- Username -->
      <label class="field">
        <span>Nombre de usuario</span>
        <input
          v-model="username"
          type="text"
          placeholder="Ej: Dubu"
          maxlength="18"
        />
      </label>

      <!-- Avatars -->
      <AvatarGallery v-model="selectedAvatarId" />



      <!-- Error -->
      <p v-if="error" class="error">
        {{ error }}
      </p>

      <!-- Submit -->
      <button type="submit" class="submit">
        {{ submitLabel }}
      </button>
    </form>

    <!-- Room hint -->
    <footer v-if="roomIdFromQuery" class="room-hint">
      Sala detectada:
      <code>{{ roomIdFromQuery }}</code>
    </footer>
  </main>
</template>

<style scoped lang="scss">

</style>
