<template>
  <div class="d-flex flex-wrap" ref="gridContainer">
    <v-card flat class="mt-1 ml-1" v-for="item of media" :key="item.id" :to="`/view/${item.id}`">
      <v-img :width="imageWidth" :height="imageWidth" cover :src="`http://ruimartins-nc.duckdns.org:3000/files/${item.previews[3]}`" :options="{ rootMargin: '100px' }" />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getClosestNumber } from "./helpers"

import type { Media } from "../stores/photos/models"

interface Props {
  media: Media[]
}

const { media } = defineProps<Props>()

const gridContainer = ref(null)
const imageWidth = ref(128)

const onResize = () => {
  let width = gridContainer.value.clientWidth
  const cardWidth = []
  for (let i = 1; i < 20; i++) {
    cardWidth.push(Math.floor((width - (i + 1) * 4) / i))
  }
  imageWidth.value = getClosestNumber(128, cardWidth)
}

window.addEventListener("resize", onResize)

onMounted(() => {
  onResize()
})
</script>
