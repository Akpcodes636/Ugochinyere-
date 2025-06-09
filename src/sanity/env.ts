export const apiVersion = '2025-06-07';

export const dataset = assertValue('production', 'Missing dataset');

export const projectId = assertValue('udk9tkmx', 'Missing projectId');

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
