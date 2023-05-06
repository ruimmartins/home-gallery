import dayjs from "dayjs"

import type { Media, MediaByMonthMap, DatabaseMedia } from "./models"

const mapMedia = (media: Media) => {
  const { id, files, previews, date } = media
  return { id, files, previews, date }
}

const mapMediaByMonth = (toUpdate: DatabaseMedia[]): MediaByMonthMap => {
  let map: MediaByMonthMap = {}
  for (let media of toUpdate) {
    let m = mapMedia(media)
    let date = dayjs(m.date).format("YYYY-MM")
    if (map[date]) map[date].push(m)
    else map[date] = [m]
  }
  return map
}

export const updateMedia = (media: MediaByMonthMap, toUpdate: DatabaseMedia[]): MediaByMonthMap => {
  let map = mapMediaByMonth(toUpdate)
  for (let date of Object.keys(map)) {
    if (media[date]) media[date].push(...map[date])
    else media[date] = map[date]
  }
  return media
}

export const mediaAlreadyExists = (media: MediaByMonthMap, toUpdate: DatabaseMedia[]): number => {
  for (const month of Object.keys(media)) {
    for (const m of media[month]) {
      for (const t of toUpdate) {
        if (m.id === t.id) {
          return toUpdate.indexOf(t)
        }
      }
    }
  }
  return -1
}
