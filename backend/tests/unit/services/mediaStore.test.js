'use strict';

// mediaStore picks R2 when configured, else Cloudinary; destroy() routes each
// stored file to the store its URL belongs to.
jest.mock('../../../services/r2Service', () => ({
  isConfigured: jest.fn(() => true),
  keyOf: jest.fn((u) => (typeof u === 'string' && u.startsWith('https://media.test/') ? u.slice('https://media.test/'.length) : null)),
  uploadImage: jest.fn(async () => ({ secure_url: 'https://media.test/proctor-shots/1_a.jpg', public_id: 'proctor-shots/1_a.jpg', width: 10, height: 5 })),
  uploadAvatar: jest.fn(async () => ({ secure_url: 'https://media.test/avatars/1_a.webp', public_id: 'avatars/1_a.webp' })),
  uploadFile: jest.fn(async () => ({ secure_url: 'https://media.test/writing-samples/1_a.pdf', public_id: 'writing-samples/1_a.pdf' })),
  uploadAudio: jest.fn(async () => ({ secure_url: 'https://media.test/entrance-speaking/et_1.webm', duration: 3 })),
  deleteObjects: jest.fn(async (keys) => keys.length),
}));
jest.mock('../../../services/cloudinaryService', () => ({
  uploadImage: jest.fn(async () => ({ secure_url: 'https://res.cloudinary.com/x/a.jpg', public_id: 'assignments/a' })),
  destroyAssets: jest.fn(async (ids) => ids.length),
  destroyAsset: jest.fn(async () => {}),
}));

const r2Service = require('../../../services/r2Service');
const cloudinaryService = require('../../../services/cloudinaryService');
const mediaStore = require('../../../services/mediaStore');

beforeEach(() => jest.clearAllMocks());

test('uploads go to R2 when it is configured', async () => {
  const img = await mediaStore.uploadImage('data:image/jpeg;base64,AAAA', 'proctor-shots');
  expect(r2Service.uploadImage).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA', { folder: 'proctor-shots' });
  expect(img).toEqual({ url: 'https://media.test/proctor-shots/1_a.jpg', publicId: 'proctor-shots/1_a.jpg', width: 10, height: 5 });

  expect((await mediaStore.uploadAvatar('data:image/png;base64,AAAA')).url).toBe('https://media.test/avatars/1_a.webp');
  expect(r2Service.uploadFile).not.toHaveBeenCalled();
  await mediaStore.uploadPdf(Buffer.from('%PDF'), 'writing-samples');
  expect(r2Service.uploadFile).toHaveBeenCalledWith(expect.any(Buffer), { folder: 'writing-samples', ext: 'pdf', contentType: 'application/pdf' });

  const rec = await mediaStore.uploadRecording(Buffer.from('x'), 'audio/webm;codecs=opus', 'entrance-speaking', 'et_1');
  expect(r2Service.uploadAudio).toHaveBeenCalledWith(expect.any(Buffer), { folder: 'entrance-speaking', public_id: 'et_1', ext: 'webm', contentType: 'audio/webm' });
  expect(rec.publicId).toBe('entrance-speaking/et_1.webm');
  expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
});

test('falls back to Cloudinary when R2 is not configured', async () => {
  r2Service.isConfigured.mockReturnValueOnce(false);
  const img = await mediaStore.uploadImage('data:image/jpeg;base64,AAAA', 'assignments');
  expect(cloudinaryService.uploadImage).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA', { folder: 'assignments' });
  expect(img.url).toBe('https://res.cloudinary.com/x/a.jpg');
});

test('in production a missing R2 config fails the upload — never a silent Cloudinary upload', async () => {
  const env = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  r2Service.isConfigured.mockReturnValue(false);
  try {
    await expect(mediaStore.uploadImage('data:image/jpeg;base64,AAAA', 'assignments')).rejects.toThrow(/R2 is not configured/);
    await expect(mediaStore.uploadCover('data:image/jpeg;base64,AAAA')).rejects.toThrow(/R2 is not configured/);
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  } finally {
    process.env.NODE_ENV = env;
    r2Service.isConfigured.mockReturnValue(true);
  }
});

test('destroy deletes R2 files by key and pre-R2 files by Cloudinary public_id', async () => {
  const n = await mediaStore.destroy([
    { url: 'https://media.test/proctor-shots/1_a.jpg', publicId: 'proctor-shots/1_a.jpg' },
    { url: 'https://res.cloudinary.com/x/image/upload/v1/proctor-shots/old.jpg', publicId: 'proctor-shots/old' },
    { url: '', publicId: '' },
  ]);
  expect(r2Service.deleteObjects).toHaveBeenCalledWith(['proctor-shots/1_a.jpg']);
  expect(cloudinaryService.destroyAssets).toHaveBeenCalledWith(['proctor-shots/old']);
  expect(n).toBe(2);
});

test('destroy never throws when a store fails', async () => {
  r2Service.deleteObjects.mockRejectedValueOnce(new Error('R2 down'));
  await expect(mediaStore.destroy({ url: 'https://media.test/a.jpg' })).resolves.toBe(0);
});
