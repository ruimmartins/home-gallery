<script setup lang="ts">
import { usePhotosStore } from "./stores/photos/store"
import { onBeforeMount } from "vue"

const photosStore = usePhotosStore()

onBeforeMount(async () => {
  await photosStore.loadMedia()
})
</script>

<template>
  <RouterView />
</template>
