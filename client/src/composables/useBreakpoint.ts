import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
}

export function useBreakpoint() {
  const width = ref<number>(window.innerWidth)

  const onResize = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  const isAbove = (bp: Breakpoint) => {
    return computed(() => width.value >= BREAKPOINTS[bp])
  }

  const isBelow = (bp: Breakpoint) => {
    return computed(() => width.value < BREAKPOINTS[bp])
  }

  const current = computed<Breakpoint>(() => {
    return (
      (Object.keys(BREAKPOINTS) as Breakpoint[])
        .slice()
        .reverse()
        .find((bp) => width.value >= BREAKPOINTS[bp]) ?? 'xs'
    )
  })

  return {
    width,
    current,
    isAbove,
    isBelow,
  }
}
