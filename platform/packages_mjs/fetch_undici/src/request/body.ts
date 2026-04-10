/**
 * Request body handling for fetch-undici
 *
 * Handles JSON, form data, files, and raw content.
 */

import { Readable } from 'stream'
import { logger } from '../logger.js'
import { Headers, type HeadersInit } from '../models/headers.js'
import { RequestOptionsError } from '../exceptions/base.js'

const log = logger.create('fetch-undici', import.meta.url)

/** File upload types */
export interface FileUpload {
  content: Buffer | Blob | Readable | string
  filename?: string
  contentType?: string
}

/** Body options for requests */
export interface BodyOptions {
  /** JSON body (auto-serialized) */
  json?: unknown
  /** Form data (URL-encoded or FormData) */
  data?: Record<string, unknown> | FormData | URLSearchParams
  /** Raw content */
  content?: string | Buffer | Uint8Array | Readable
  /** File uploads (multipart) */
  files?: Record<string, FileUpload | Buffer | string>
}

/** Processed body result */
export interface ProcessedBody {
  body: string | Buffer | Readable | FormData | null
  headers: Headers
}

/**
 * Process body options into Undici-compatible body
 */
export function processBody(options: BodyOptions, existingHeaders?: HeadersInit): ProcessedBody {
  const headers = new Headers(existingHeaders)
  let bodyCount = 0

  // Count provided body options
  if (options.json !== undefined) bodyCount++
  if (options.data !== undefined) bodyCount++
  if (options.content !== undefined) bodyCount++
  if (options.files !== undefined) bodyCount++

  // Check for conflicts
  if (bodyCount > 1 && !options.files) {
    throw new RequestOptionsError(
      'Cannot specify multiple body options (json, data, content). Use only one.'
    )
  }

  // Handle JSON
  if (options.json !== undefined) {
    log.trace('Processing JSON body')
    const jsonBody = JSON.stringify(options.json)
    headers.set('Content-Type', 'application/json')
    return { body: jsonBody, headers }
  }

  // Handle files (multipart)
  if (options.files) {
    log.trace('Processing file uploads')
    const formData = buildMultipartFormData(options.files, options.data)
    // FormData sets its own Content-Type with boundary
    return { body: formData, headers }
  }

  // Handle form data
  if (options.data !== undefined) {
    log.trace('Processing form data')

    if (options.data instanceof FormData) {
      return { body: options.data, headers }
    }

    if (options.data instanceof URLSearchParams) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded')
      return { body: options.data.toString(), headers }
    }

    // Plain object - convert to URLSearchParams
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(options.data)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          params.append(key, String(v))
        }
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
    headers.set('Content-Type', 'application/x-www-form-urlencoded')
    return { body: params.toString(), headers }
  }

  // Handle raw content
  if (options.content !== undefined) {
    log.trace('Processing raw content')

    if (typeof options.content === 'string') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'text/plain')
      }
      return { body: options.content, headers }
    }

    if (options.content instanceof Uint8Array) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/octet-stream')
      }
      return { body: Buffer.from(options.content), headers }
    }

    if (Buffer.isBuffer(options.content)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/octet-stream')
      }
      return { body: options.content, headers }
    }

    // Stream
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/octet-stream')
    }
    return { body: options.content, headers }
  }

  return { body: null, headers }
}

/**
 * Build multipart FormData from files and optional data
 */
function buildMultipartFormData(
  files: Record<string, FileUpload | Buffer | string>,
  data?: Record<string, unknown> | FormData | URLSearchParams
): FormData {
  const formData = new FormData()

  // Add regular data fields first
  if (data) {
    if (data instanceof FormData) {
      for (const [key, value] of data.entries()) {
        formData.append(key, value)
      }
    } else if (data instanceof URLSearchParams) {
      for (const [key, value] of data.entries()) {
        formData.append(key, value)
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            formData.append(key, String(v))
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      }
    }
  }

  // Add files
  for (const [fieldName, file] of Object.entries(files)) {
    if (Buffer.isBuffer(file) || typeof file === 'string') {
      // Simple file
      const content = typeof file === 'string' ? file : file
      const blob = new Blob([content])
      formData.append(fieldName, blob, fieldName)
    } else {
      // FileUpload object
      const { content, filename, contentType } = file

      let blob: Blob
      if (content instanceof Blob) {
        blob = content
      } else if (Buffer.isBuffer(content) || typeof content === 'string') {
        blob = new Blob([content], { type: contentType })
      } else {
        // Stream - need to consume it
        throw new RequestOptionsError('Streaming file uploads are not directly supported. Buffer the content first.')
      }

      formData.append(fieldName, blob, filename || fieldName)
    }
  }

  log.trace('Built multipart form data', {
    fileCount: Object.keys(files).length,
    hasData: !!data
  })

  return formData
}

/**
 * Check if body options contain a body
 */
export function hasBodyOptions(options: BodyOptions): boolean {
  return (
    options.json !== undefined ||
    options.data !== undefined ||
    options.content !== undefined ||
    options.files !== undefined
  )
}
