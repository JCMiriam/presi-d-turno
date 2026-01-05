<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { ButtonProps } from './Button.types'
import { Icon } from '@components';

const attrs = useAttrs()
const isIconOnly = computed(() => Boolean(props.icon) && !props.text)

const props = withDefaults(defineProps<ButtonProps>(), {
  iconPosition: 'left',
  size: 'md',
  disabled: false,
  loading: false,
  iconShape: 'round',
  type: 'button',
  appearance: 'solid',
  color: 'pure-white'
})

const classes = computed(() => ({
  button: true,
  [props.variant]: true,
  [props.appearance]: true,
  [props.size]: true,
  'icon-only': isIconOnly.value && props.iconShape !== 'round',
  'icon-round': isIconOnly.value && props.iconShape === 'round',
}))
</script>

<template>
  <button :type="props.type" :class="classes" :disabled="disabled || loading" v-bind="attrs">
    <span v-if="loading" class="loader" aria-hidden="true"></span>

    <template v-else>
      <Icon
        v-if="icon && iconPosition === 'left'"
        :icon="icon"
        :size="24"
        :color="color"
        class="icon icon--left"
        aria-hidden="true"
      />

      <span v-if="text" class="text">{{ text }}</span>

      <Icon
        v-if="icon && iconPosition === 'right'"
        :icon="icon"
        :size="24"
        :color="color"
        class="icon icon--right"
        aria-hidden="true"
      />
    </template>
  </button>
</template>

<style scoped lang="scss">
@use './Button.styles.scss';
</style>
