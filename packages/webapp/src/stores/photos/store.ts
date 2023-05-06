import { ref } from "vue"
import { defineStore, storeToRefs } from "pinia"

import type { Media, Database } from "./models"

import { updateMedia, mediaAlreadyExists } from "./helpers"

export const usePhotosStore = defineStore("photos", () => {
  const media = ref<Media[]>([])

  let start = 0
  let limit = 1000
  let allLoaded = false

  const getMedia = async (): Promise<Database> => {
    const response = await fetch(`http://ruimartins-nc.duckdns.org:3000/api/database.json?offset=${start}&limit=${limit}`)
    return (await response.json()) as Database
  }

  const loadMedia = async () => {
    while (!allLoaded) {
      try {
        const database: Database = await getMedia()
        if (!database.data.length) {
          allLoaded = true
          return
        }
        media.value = media.value.concat(database.data)
        start += limit
      } catch (e) {
        allLoaded = true
      }
    }
  }

  return { media, loadMedia }
})
