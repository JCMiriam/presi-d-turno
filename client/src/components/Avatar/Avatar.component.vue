<script setup lang="ts">
import { computed } from "vue";
import type { AvatarProps } from "./Avatar.types";

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  decorative: false
});

const computedAlt = computed(() => (props.decorative ? "" : props.alt));

const src = computed(() => {
  const safeId = Number.isFinite(props.id) ? props.id : 0;
  const clampedId = Math.min(41, Math.max(0, safeId));
  const padded = clampedId.toString().padStart(2, "0");
  return `/src/assets/images/avatars/avatar-${padded}.svg`;
});
</script>

<template>
  <img
    class="avatar"
    :class="`avatar--${size}`"
    :src="src"
    :alt="computedAlt"
    loading="lazy"
    draggable="false"
  />
</template>

<style scoped lang="scss">
@use "./Avatar.styles.scss";
</style>
