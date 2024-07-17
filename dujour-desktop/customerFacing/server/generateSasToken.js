require('dotenv').config(); // This should be at the very top of your file

const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");

// Azure credentials - use environment variables or other secure methods to store sensitive information
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

async function generateSasUrl(containerName, blobName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const sasOptions = {
    containerName,
    blobName,
    startsOn: new Date(), // Start time for the SAS token
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiration
    permissions: BlobSASPermissions.parse("r"), // Set permissions to read
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
  return `${blobClient.url}?${sasToken}`;
}

// Example usage
generateSasUrl("dujourimages", "image1.jpg").then(url => {
  console.log("SAS URL:", url);
}).catch(error => {
  console.error("Error generating SAS URL:", error);
});
