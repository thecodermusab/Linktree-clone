import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { checkAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const isImage = imageTypes.includes(file.type)
  const isVideo = videoTypes.includes(file.type)

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Only jpg, png, gif, webp, mp4, webm, mov allowed' },
      { status: 400 }
    )
  }

  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large (max ${isVideo ? '50MB' : '10MB'})` },
      { status: 400 }
    )
  }

  // Create S3 client inside handler so env vars are always fresh
  const s3 = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
  })

  const ext = file.name.split('.').pop()
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    })
  )

  const cdnBase = (process.env.DO_SPACES_REGION ?? '').replace(/\/$/, '')
  const url = `${cdnBase}/${filename}`

  return NextResponse.json({ url })
}
