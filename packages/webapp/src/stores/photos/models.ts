export interface Database {
  type: string
  created: string
  data: Media[]
}

export interface Media {
  id: string
  type: string
  updated: string
  date: string
  files: File[]
  previews: string[]
  vibrantColors: string[]
  tags: string[]
  objects: any[]
  faces: any[]
  tz: string
  width: number
  height: number
  orientation: number
  duration: number
  make: string
  model: string
  iso: number
  aperture: number
  exposureMode: string
  focalLength: number
  focalLength33mm: number
  whiteBalance: string
  addresstype: string
  country: string
  state: string
  city: string
  latitude: number
  longitude: number
  altitude: number
  similarityHash: string
}

export interface File {
  id: string
  index: string
  type: string
  size: number
  filename: string
}
