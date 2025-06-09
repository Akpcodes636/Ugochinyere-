import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId: "udk9tkmx",
  dataset: "production",
  apiVersion: "2023-01-01", // use a fixed past date
  useCdn: true,
});
