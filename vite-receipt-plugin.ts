import type { Plugin } from 'vite'
import { existsSync, mkdirSync, createWriteStream, readdirSync } from 'fs'
import { join, resolve } from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

const RECEIPT_DIR = resolve(__dirname, '..', 'receipt')
const QUOTATION_DIR = resolve(__dirname, '..', 'Qutation')

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function receiptUploadPlugin(): Plugin {
  return {
    name: 'receipt-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload-receipt', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const supplier = decodeURIComponent(req.headers['x-supplier'] as string || 'unknown')
        const paymentDate = (req.headers['x-payment-date'] as string) || 'nodate'
        const originalName = decodeURIComponent(req.headers['x-original-name'] as string || 'receipt')

        ensureDir(RECEIPT_DIR)

        const safeName = `${sanitize(supplier)}_${paymentDate}_${sanitize(originalName)}`
        const filePath = join(RECEIPT_DIR, safeName)

        const stream = createWriteStream(filePath)
        req.pipe(stream)

        stream.on('finish', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, fileName: safeName }))
        })

        stream.on('error', () => {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Failed to save file' }))
        })
      })

      server.middlewares.use('/api/upload-quotation', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const supplier = decodeURIComponent(req.headers['x-supplier'] as string || 'unknown')
        const originalName = decodeURIComponent(req.headers['x-original-name'] as string || 'quotation')

        ensureDir(QUOTATION_DIR)

        const safeName = `${sanitize(supplier)}_${Date.now()}_${sanitize(originalName)}`
        const filePath = join(QUOTATION_DIR, safeName)

        const stream = createWriteStream(filePath)
        req.pipe(stream)

        stream.on('finish', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, fileName: safeName }))
        })

        stream.on('error', () => {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Failed to save file' }))
        })
      })

      // Serve receipt files for viewing/download
      server.middlewares.use('/receipts', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method !== 'GET') { next(); return }
        const fileName = decodeURIComponent((req.url || '').replace(/^\//, ''))
        if (!fileName || fileName.includes('..')) {
          res.writeHead(400); res.end('Bad request'); return
        }
        const filePath = join(RECEIPT_DIR, fileName)
        if (!existsSync(filePath)) {
          res.writeHead(404); res.end('Not found'); return
        }

        const ext = fileName.split('.').pop()?.toLowerCase() || ''
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        const contentType = mimeMap[ext] || 'application/octet-stream'
        const { createReadStream, statSync } = require('fs') as typeof import('fs')
        const stat = statSync(filePath)
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stat.size,
          'Content-Disposition': `inline; filename="${fileName}"`
        })
        createReadStream(filePath).pipe(res)
      })

      server.middlewares.use('/quotations', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method !== 'GET') { next(); return }
        const fileName = decodeURIComponent((req.url || '').replace(/^\//, ''))
        if (!fileName || fileName.includes('..')) {
          res.writeHead(400); res.end('Bad request'); return
        }
        const filePath = join(QUOTATION_DIR, fileName)
        if (!existsSync(filePath)) {
          res.writeHead(404); res.end('Not found'); return
        }

        const ext = fileName.split('.').pop()?.toLowerCase() || ''
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        const contentType = mimeMap[ext] || 'application/octet-stream'
        const { createReadStream, statSync } = require('fs') as typeof import('fs')
        const stat = statSync(filePath)
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stat.size,
          'Content-Disposition': `inline; filename="${fileName}"`
        })
        createReadStream(filePath).pipe(res)
      })

      // List receipts
      server.middlewares.use('/api/list-receipts', (_req: IncomingMessage, res: ServerResponse) => {
        ensureDir(RECEIPT_DIR)
        const files = readdirSync(RECEIPT_DIR)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ files }))
      })
    }
  }
}
