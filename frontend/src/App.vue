<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

</script>

<template>
  <router-view></router-view>
</template>

<style>
@font-face {
    font-family: inter;
    src: url('./assets/inter.ttf');
}

@font-face {
    font-family: interblack;
    src: url('./assets/interblack.ttf');
}

body{
  width: 100%;
  height: 100%;
}
</style>

