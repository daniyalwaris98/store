import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const SEAWEED_S3_ENDPOINT = process.env.SEAWEED_S3_ENDPOINT || "https://s3.robodialog.com"
const SEAWEED_S3_BUCKET = process.env.SEAWEED_S3_BUCKET || "robodialog"

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: SEAWEED_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
})

export interface UploadResponse {
  url: string
  publicId: string
  type: "image" | "video" | "file"
  width?: number
  height?: number
  size: number
  originalFilename: string
}

export interface UploadOptions {
  folder?: string
  transformation?: string
}

function getFileType(file: File | Blob): "image" | "video" | "file" {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "file"
}

function getPublicIdFromUrl(url: string): string {
  // URL format: https://s3.robodialog.com/robodialog/folder/filename
  const parts = url.split("/")
  return parts.slice(3).join("/") // Remove protocol and hostname
}

export async function uploadToSeaweed(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileExtension = file instanceof File ? file.name.split(".").pop() : "bin"
  const timestamp = Date.now()
  const originalFilename = file instanceof File ? file.name : "upload"
  const folder = options.folder || "misc"

  // Construct S3 key: folder/timestamp.filename
  const ext = `.${fileExtension}`
  const s3Key = `${folder}/${timestamp}${ext}`

  const command = new PutObjectCommand({
    Bucket: SEAWEED_S3_BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: file.type,
    Metadata: {
      originalFilename,
    },
  })

  await s3Client.send(command)

  const url = `https://s3.robodialog.com/${SEAWEED_S3_BUCKET}/${s3Key}`
  const publicId = s3Key

  return {
    url,
    publicId,
    type: getFileType(file),
    size: buffer.length,
    originalFilename,
  }
}

export async function deleteFromSeaweed(publicId: string): Promise<void> {
  console.log("[deleteFromSeaweed] Deleting:", publicId)
  const command = new DeleteObjectCommand({
    Bucket: SEAWEED_S3_BUCKET,
    Key: publicId,
  })
  await s3Client.send(command)
  console.log("[deleteFromSeaweed] Success")
}

export async function getSeaweedUrl(publicId: string): Promise<string> {
  return `https://s3.robodialog.com/${SEAWEED_S3_BUCKET}/${publicId}`
}