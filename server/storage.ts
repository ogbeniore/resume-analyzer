import path from "path";
import fs from "fs/promises";
import os from "os";

// Simple in-memory storage for temporary files
const tempFiles = new Map<string, { path: string; expires: number }>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; 

// File expiration time (30 minutes)
const FILE_EXPIRATION = 30 * 60 * 1000;

// Regular cleanup of expired files
setInterval(async () => {
  const now = Date.now();
  const expiredFiles = Array.from(tempFiles.entries()).filter(
    ([_, info]) => info.expires < now
  );

  for (const [id, info] of expiredFiles) {
    try {
      await fs.unlink(info.path);
      tempFiles.delete(id);
    } catch (error) {
      console.error(`Failed to delete expired file ${id}:`, error);
    }
  }
}, CLEANUP_INTERVAL);

export const storage = {
  /**
   * Saves a file to temporary storage
   */
  async saveFile(
    fileBuffer: Buffer,
    originalFilename: string
  ): Promise<{ id: string; path: string }> {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const ext = path.extname(originalFilename);
    const tempFilePath = path.join(os.tmpdir(), `${id}${ext}`);

    await fs.writeFile(tempFilePath, fileBuffer);
    tempFiles.set(id, {
      path: tempFilePath,
      expires: Date.now() + FILE_EXPIRATION,
    });

    return { id, path: tempFilePath };
  },

  /**
   * Gets file info by ID
   */
  getFileInfo(id: string): { path: string } | null {
    const fileInfo = tempFiles.get(id);
    if (!fileInfo) return null;

    // Update expiration time when file is accessed
    fileInfo.expires = Date.now() + FILE_EXPIRATION;
    tempFiles.set(id, fileInfo);

    return { path: fileInfo.path };
  },

  /**
   * Deletes a file by ID
   */
  async deleteFile(id: string): Promise<boolean> {
    const fileInfo = tempFiles.get(id);
    if (!fileInfo) return false;

    try {
      await fs.unlink(fileInfo.path);
      tempFiles.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${id}:`, error);
      return false;
    }
  },
};
