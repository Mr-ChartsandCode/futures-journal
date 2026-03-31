import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { parseDailyStatement } from '../src/utils/parseDailyStatement.js'

export const config = {
  api: { bodyParser: false }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from('--' + boundary)
  const parts = []
  let start = 0

  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuf, start)
    if (boundaryIdx === -1) break
    const headerStart = boundaryIdx + boundaryBuf.length + 2
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart)
    if (headerEnd === -1) break
    const dataStart = headerEnd + 4
    const nextBoundary = buffer.indexOf(boundaryBuf, dataStart)
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2
    const headers = buffer.slice(headerStart, headerEnd).toString()
    const data = buffer.slice(dataStart, dataEnd)
    parts.push({ headers, data })
    start = nextBoundary === -1 ? buffer.length : nextBoundary
  }
  return parts
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const rawBody = await getRawBody(req)
    const contentType = req.headers['content-type'] || ''
    const boundaryMatch = contentType.match(/boundary=(.+)/)
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' })

    const parts = parseMultipart(rawBody, boundaryMatch[1])
    const pdfPart = parts.find(p => p.headers.includes('filename'))
    if (!pdfPart) return res.status(400).json({ error: 'No PDF found in request' })

    const parsed = await pdfParse(pdfPart.data)
    const text = parsed.text

    console.log('PDF TEXT:', text.slice(0, 500))

    const result = parseDailyStatement(text)
    res.status(200).json(result)
  } catch (err) {
    console.error('PDF parse error:', err)
    res.status(500).json({ error: err.message })
  }
}