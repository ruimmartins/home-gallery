<template>
  <PhotoGrid :media="recentMedia" />
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { storeToRefs } from "pinia"
import { computed } from "vue"
import { usePhotosStore } from "../stores/photos/store"

import PhotoGrid from "../components/PhotoGrid.vue"

const photosStore = usePhotosStore()

const { media } = storeToRefs(photosStore)

const recentMedia = computed(() => media.value.slice(0, 1500))

/* const getMonth = (date: string) => dayjs(date).format("MMMM")
const getYear = (date: string) => dayjs(date).format("YYYY") */
</script>
