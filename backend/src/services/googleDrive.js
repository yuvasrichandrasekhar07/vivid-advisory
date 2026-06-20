const { google } = require('googleapis');
const { Readable } = require('stream');

if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 || !process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
  console.warn('[GoogleDrive] Drive env vars not set — file upload will be unavailable.');
}

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Create a subfolder inside the parent Vivid Advisory Drive folder for a listing.
 * @returns {Promise<string>} folderId
 */
async function createListingFolder(listingId, listingTitle) {
  const safeName = `[${listingId}] ${listingTitle}`.slice(0, 200);
  try {
    const res = await drive.files.create({
      requestBody: {
        name: safeName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID],
      },
      fields: 'id',
    });
    return res.data.id;
  } catch (err) {
    throw new Error(`Drive folder creation failed: ${err.message}`);
  }
}

/**
 * Upload a file buffer to a Drive folder and make it publicly readable.
 * @returns {Promise<{ fileId: string, webViewLink: string, webContentLink: string }>}
 */
async function uploadFile(folderId, fileBuffer, fileName, mimeType) {
  try {
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: 'id,webViewLink,webContentLink',
    });

    // Make publicly viewable — required for frontend to display without Google login
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return {
      fileId: res.data.id,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
    };
  } catch (err) {
    throw new Error(`Drive file upload failed: ${err.message}`);
  }
}

/**
 * Delete a file from Drive. Silently swallows 404 (file already deleted).
 */
async function deleteFile(fileId) {
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    if (err.code === 404 || err.status === 404) {
      console.warn(`[Drive] File ${fileId} not found on deletion — skipping.`);
      return;
    }
    throw new Error(`Drive file deletion failed: ${err.message}`);
  }
}

module.exports = { createListingFolder, uploadFile, deleteFile };
