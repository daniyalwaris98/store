import imageCompression from "browser-image-compression"

export interface CompressionOptions {
  maxWidthOrHeight: number
  useWebP: boolean
  maxSizeMB: number
}

export interface ProcessedFile {
  file: File
  isVideo: boolean
  wasCompressed: boolean
  originalSize: number
  compressedSize?: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1980,
  useWebP: true,
  maxSizeMB: 1,
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/")
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

export function randomizeFileName(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6)
  return `${timestamp}${random}`
}

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<ProcessedFile> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (isVideoFile(file)) {
    return {
      file,
      isVideo: true,
      wasCompressed: false,
      originalSize: file.size,
    }
  }

  if (!isImageFile(file)) {
    return {
      file,
      isVideo: false,
      wasCompressed: false,
      originalSize: file.size,
    }
  }

  const originalSize = file.size

  // Determine output filename — keep original name but use .webp extension
  const baseName = randomizeFileName()
  // const baseName = file.name.replace(/\.[^.]+$/, "")
  const outputFileName = `${baseName}.webp`

  const compressionOptions = {
    maxSizeMB: opts.maxSizeMB,
    maxWidthOrHeight: opts.maxWidthOrHeight,
    fileType: opts.useWebP ? ("image/webp" as const) : undefined,
    useWebWorker: true,
    initialQuality: 0.8,
    onProgress: () => {},
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)
    // Create a new File with correct .webp name so Openinary sees the right extension
    const webpFile = new File([compressedFile], outputFileName, { type: "image/webp" })
    return {
      file: webpFile,
      isVideo: false,
      wasCompressed: true,
      originalSize,
      compressedSize: webpFile.size,
    }
  } catch (error) {
    console.error("Image compression failed:", error)
    return {
      file,
      isVideo: false,
      wasCompressed: false,
      originalSize: file.size,
    }
  }
}

export async function processFiles(
  files: File[],
  options: Partial<CompressionOptions> = {},
  onProgress?: (completed: number, total: number) => void
): Promise<ProcessedFile[]> {
  const results: ProcessedFile[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options)
    results.push(result)
    onProgress?.(i + 1, files.length)
  }

  return results
}