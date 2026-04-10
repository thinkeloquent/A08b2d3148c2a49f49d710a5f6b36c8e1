/**
 * Upload Module — Sauce Labs API Client (Mobile Distribution)
 *
 * Upload mobile binaries (APK, IPA, AAB) for distribution and testing.
 *
 * Endpoint:
 *   POST /api/upload/   (Mobile Distribution base URL)
 */

import { create } from '../logger.mjs';
import { SaucelabsValidationError } from '../errors.mjs';
import { VALID_UPLOAD_EXTENSIONS } from '../types.mjs';
import { readFile } from 'node:fs/promises';
import { extname, basename } from 'node:path';

const log = create('saucelabs-api', import.meta.url);

export class UploadModule {
  /**
   * @param {import('../client.mjs').SaucelabsClient} client
   */
  constructor(client) {
    this._client = client;
    this._logger = log;
  }

  /**
   * Upload a mobile app binary.
   *
   * @param {object} params
   * @param {string|Buffer} params.file - File path or Buffer
   * @param {string} params.apiKey - Distribution API key
   * @param {string} [params.appName] - Display name for the app
   * @param {boolean} [params.uploadToSaucelabs=false] - Also upload to RDC
   * @param {boolean} [params.notify=false] - Email testers
   * @returns {Promise<object>} Upload result
   */
  async uploadApp(params = {}) {
    const { file, apiKey, appName, uploadToSaucelabs = false, notify = false } = params;

    if (!file) {
      throw new SaucelabsValidationError('file is required for upload');
    }
    if (!apiKey) {
      throw new SaucelabsValidationError('apiKey is required for mobile upload');
    }

    // Read file if it's a path string
    let fileBuffer;
    let fileName;
    if (typeof file === 'string') {
      const ext = extname(file).toLowerCase();
      if (!VALID_UPLOAD_EXTENSIONS.includes(ext)) {
        throw new SaucelabsValidationError(
          `file must have extension: ${VALID_UPLOAD_EXTENSIONS.join(', ')} — got "${ext}"`,
        );
      }
      fileBuffer = await readFile(file);
      fileName = basename(file);
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
      fileName = appName ? `${appName}.apk` : 'app.apk';
    } else {
      throw new SaucelabsValidationError('file must be a file path string or Buffer');
    }

    this._logger.info('uploading app', {
      fileName,
      appName: appName || fileName,
      uploadToSaucelabs,
      notify,
      sizeBytes: fileBuffer.length,
    });

    // Build multipart form data
    const formData = new FormData();
    formData.set('api_key', apiKey);
    formData.set('file', new Blob([fileBuffer]), fileName);
    if (appName) formData.set('app_name', appName);
    if (uploadToSaucelabs) formData.set('upload_to_saucelabs', 'on');
    if (notify) formData.set('notify', 'on');

    // Use mobile base URL — POST without Content-Type (let FormData set boundary)
    return this._client._request('POST', '/api/upload/', {
      body: formData,
      mobile: true,
      contentType: null, // let FormData set its own content-type
      headers: {},
    });
  }
}
