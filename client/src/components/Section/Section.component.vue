<script setup lang="ts">
import type { SectionProps } from './Section.types'

const props = withDefaults(defineProps<SectionProps>(), {
  hasLogo: true,
  hasHeader: true,
  scrollable: false,
  size: 'md',
})
</script>

<template>
  <section class="section">
    <div
      class="section__panel"
      :class="{
        'section__panel--scrollable': scrollable,
        [`section__panel--${size}`]: true,
      }"
    >
      <header v-if="hasHeader && (title || subtitle)" class="section__header">
        <div class="section__header__container">
          <div v-if="hasLogo" class="section__header--logo">
            <img src="../../assets/images/pdt-fullcolor-logo.svg" draggable="false" />
          </div>

          <div class="section__header--content">
            <span v-if="subtitle" class="section__header--subtitle">{{ subtitle }}</span>
            <span v-if="title" class="section__header--title">{{ title }}</span>
          </div>
        </div>
      </header>

      <div class="section__content">
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use './Section.styles.scss';
</style>
