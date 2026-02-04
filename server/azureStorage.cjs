const { BlobServiceClient } = require("@azure/storage-blob");
const crypto = require("crypto");
const path = require('path');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

async function uploadToBlob(buffer, originalName) {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        console.warn("Azure Storage connection string not found. using mock/local handling or error.");
        throw new Error("Azure Storage configuration missing.");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = "uploads";
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    if (!(await containerClient.exists())) {
        await containerClient.create({ access: 'blob' }); // Public access to blobs
    }

    const extension = path.extname(originalName);
    const blobName = crypto.randomUUID() + extension;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer);

    return blockBlobClient.url;
}

module.exports = {
    uploadToBlob
};
