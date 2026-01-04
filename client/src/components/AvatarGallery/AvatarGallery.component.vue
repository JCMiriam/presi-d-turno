<script setup lang="ts">
import { computed } from "vue";
import { Avatar } from "@components/Avatar";
import { AVATARS } from "@data/avatars";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface Props {
  modelValue: number | null;
  label?: string;
  size?: AvatarSize;
  disabled?: boolean;
  minCellPx?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Elige tu avatar",
  size: "md",
  disabled: false,
  minCellPx: 64
});

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fit, minmax(${props.minCellPx}px, 1fr))`
}));

function select(id: number) {
  if (props.disabled) return;
  emit("update:modelValue", id);
}
</script>

<template>
  <section class="avatar-gallery" aria-label="Selección de avatar">
    <span class="label">{{ label }}</span>

    <div class="grid" :style="gridStyle" role="list">
      <button
        v-for="avatar in AVATARS"
        :key="avatar.id"
        type="button"
        class="cell"
        role="listitem"
        :class="{ selected: avatar.id === modelValue, disabled }"
        :aria-pressed="avatar.id === modelValue"
        :aria-label="`Seleccionar avatar ${avatar.id}`"
        :disabled="disabled"
        @click="select(avatar.id)"
      >
        <Avatar :id="avatar.id" :alt="`Avatar ${avatar.id}`" :size="size" decorative />
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "./AvatarGallery.styles.scss";
</style>
