<template>
  <v-card class="h-screen d-flex justify-center">
    <v-img v-if="currentMedia" :src="`${srcPrefix}${currentMedia.previews[1]}`" :srcset="srcSet" />
  </v-card>
</template>

<script setup lang="ts">
import { computed, reactive, onBeforeMount } from "vue"
import { useRoute } from "vue-router"

import type { Photo } from "../stores/photos/models"

import { usePhotosStore } from "../stores/photos/store"
import { storeToRefs } from "pinia"

const srcPrefix = "http://ruimartins-nc.duckdns.org:3000/files/"

const route = useRoute()
const photosStore = usePhotosStore()

const { media } = storeToRefs(photosStore)

const currentIndex = computed(() => media.value.findIndex((m) => m.id === route.params.id))
const currentMedia = computed(() => media.value?.[currentIndex.value] || null)
const nextMedia = computed(() => media.value?.[currentIndex.value + 1] || null)
const previousMedia = computed(() => media.value?.[currentIndex.value - 1] || null)

const srcSet = computed(() => {
  let srcSet = ""
  for (const preview of currentMedia.value.previews) {
    let splittedName = preview.split("-")
    const size = splittedName[splittedName.length - 1].replace(".jpg", "")
    srcSet += `${srcPrefix}${preview} ${size}w, `
  }
  return srcSet
})
</script>
