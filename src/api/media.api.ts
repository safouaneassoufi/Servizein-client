import { apiClient } from './client';

export const mediaApi = {
  getUploadUrl: (folder: string, filename: string, contentType: string) =>
    apiClient.post<any, { uploadUrl: string; key: string; publicUrl: string }>(
      '/media/upload-url',
      { folder, filename, contentType }
    ),

  // Upload direct vers R2 via presigned URL (pas par le backend)
  uploadToR2: async (uploadUrl: string, file: { uri: string; type: string; name: string }): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: await fetch(file.uri).then((r) => r.blob()),
    });
    if (!response.ok) throw new Error('Upload R2 échoué');
  },
};
