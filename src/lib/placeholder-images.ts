import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  name?: string; // Make name optional for avatars
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const ChatWallpapers: ImagePlaceholder[] = data.chatWallpapers;
