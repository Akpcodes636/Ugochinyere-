import imageUrlBuilder from '@sanity/image-url';
import { client } from '../lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'; // Import the correct type

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
