<template>
  <img 
    src="/logo-fapes.png" 
    :width="width" 
    :height="height"
    :class="className"
    alt="FAPES Logo"
  />
</template>

<script setup lang="ts">
export interface LogoProps {
  width?: number
  height?: number
  bgColor?: string
  textColor?: string
  class?: string
}

const props = withDefaults(defineProps<LogoProps>(), {
  width: 200,
  height: 80,
  bgColor: '#0284c7',
  textColor: 'white',
  class: '',
})

const className = props.class
</script>
