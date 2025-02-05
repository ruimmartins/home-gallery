const { pipeline } = require('stream');

const log = require('@home-gallery/logger')('extractor');

const { promisify } = require('@home-gallery/common');
const { readStreams } = require('@home-gallery/index');

const { concurrent, each, filter, limit, purge, memoryIndicator, processIndicator, skip, flatten } = require('@home-gallery/stream');
const mapToStorageEntry = require('./stream/map-storage-entry');
const readAllEntryFiles = require('./stream/read-all-entry-files');
const { groupByDir } = require('./stream/group-by-dir');
const { groupSidecars, ungroupSidecars } = require('./stream/group-sidecars');
const groupByEntryFilesCacheKey = require('./stream/group-entry-files-cache');
const { updateEntryFilesCache } = require('./stream/update-entry-files-cache');

const { createStorage } = require('./storage');

const {initExiftool, exif, endExiftool} = require('./extract/meta/exiftool');
const ffprobe = require('./extract/meta/ffprobe');
const geoReverse = require('./extract/meta/geo-reverse');

const embeddedRawPreview = require('./extract/image/embedded-raw-preview')
const heicPreview = require('./extract/image/heic-preview')
const rawPreviewExif = require('./extract/image/raw-preview-exif.js')
const { imagePreview } = require('./extract/image/image-preview');
const { createImageResizer } = require('./extract/image/image-resizer')
const vibrant = require('./extract/image/vibrant');
const { logPublicApiPrivacyHint, similarEmbeddings, objectDetection, faceDetection } = require('./extract/image/api-server');

const { getFfmpegPath, getFprobePath } = require('./extract/utils/ffmpeg-path')

const { video } = require('./extract/video/video');
const videoPoster = require('./extract/video/video-poster');
const { createVideoFrameExtractor } = require('./extract/video/video-frame-extractor');

const readStreamsAsync = promisify(readStreams)
const createImageResizerAsync = promisify(createImageResizer)

const byNumberDesc = (a, b) => b - a

const createExtractor = async (config) => {
  const imageResizer = await createImageResizerAsync(config)
  const ffmpegPath = getFfmpegPath(config)
  const ffprobePath = getFprobePath(config)
  const videoFrameExtractor = createVideoFrameExtractor(ffmpegPath, ffprobePath)
  const imagePreviewSizes = (config?.extractor?.image?.previewSizes || [1920, 1280, 800, 320, 128]).sort(byNumberDesc)

  return {
    ffprobePath,
    ffmpegPath,
    exiftool: initExiftool(config),
    imagePreviewSizes,
    imageResizer,
    videoFrameExtractor
  }

}
const extractData = async (options) => {
  const { config } = options
  const { indexFilenames, journal, fileFilterFn, minChecksumDate } = config.sources
  const entryStream = await readStreamsAsync(indexFilenames, journal)

  const storage = createStorage(config.storage.dir)
  const extractor = await createExtractor(config)

  const stream = {
    concurrent: 0,
    skip: 0,
    limit: 0,
    printEntry: false,
    ...config?.extractor?.stream,
    queued: 0,
    processing: 0,
    processed: 0
  }

  const { queueEntry, releaseEntry } = concurrent(stream.concurrent, stream.skip)

  return new Promise((resolve, reject) => {
    pipeline(
      entryStream,
      // only files with checksum. Exclude apple files starting with '._'
      filter(entry => entry.fileType === 'f' && entry.sha1sum && entry.size > 0),
      filter(entry => !minChecksumDate || entry.sha1sumDate > minChecksumDate),
      filter(entry => fileFilterFn(entry.filename)),
      skip(stream.skip),
      limit(stream.limit),
      mapToStorageEntry,
      each(() => stream.queued++),
      queueEntry,
      each(() => stream.processing++),
      each(entry => stream.printEntry && log.info(`Processing entry #${stream.skip + stream.processed} ${entry}`)),
      // read existing files and meta data (json files)
      readAllEntryFiles(storage),

      exif(storage, extractor),
      ffprobe(storage, extractor),

      groupByDir(),
      groupSidecars(),
      flatten(),
      // images grouped by sidecars in a dir ordered by file size
      heicPreview(storage, extractor, config),
      embeddedRawPreview(storage, extractor),
      ungroupSidecars(),
      rawPreviewExif(storage, extractor),

      // single ungrouped entries
      imagePreview(storage, extractor),
      videoPoster(storage, extractor),
      vibrant(storage, extractor),
      geoReverse(storage, config),
      logPublicApiPrivacyHint(config),
      similarEmbeddings(storage, extractor, config),
      objectDetection(storage, extractor, config),
      faceDetection(storage, extractor, config),
      video(storage, extractor, config),
      //.pipe(videoFrames(storageDir, videoFrameCount))

      releaseEntry,
      each(() => stream.processed++),
      processIndicator({onTick: ({diff, lastTime}) => log.info(lastTime, `Processed ${stream.processed} entries (#${stream.skip + stream.processed}, +${diff}, processing ${stream.processing - stream.processed} and queued ${stream.queued - stream.processing} entries)`)}),

      groupByEntryFilesCacheKey(),
      updateEntryFilesCache(storage),
      processIndicator({name: 'entry dir cache'}),
      memoryIndicator({intervalMs: 30 * 1000}),
      purge(),
      err => {
        endExiftool(extractor.exiftool, () => {
          if (err) {
            log.error(err, `Could not process entries: ${err}`)
            reject(err)
          } else {
            resolve(stream.processed)
          }
        })
      }
    );
  });
}

module.exports = extractData;
