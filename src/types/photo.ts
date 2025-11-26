export type PhotoAsset = {
  _id: string;
  filePath: string;
  context: 'gallery' | 'destination';
  destinationSlug?: string | null;
  originalName?: string | null;
  uploadedBy?: string | null;
  title?: string | null;
  createdAt: string;
};

