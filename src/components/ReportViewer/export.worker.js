import { createExport } from './exports';

self.onmessage = async ({ data }) => {
  try {
    self.postMessage({ progress: 'Preparing complete selection…' });
    const result = await createExport(data);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error.message || 'Export failed. Please retry.' });
  }
};
