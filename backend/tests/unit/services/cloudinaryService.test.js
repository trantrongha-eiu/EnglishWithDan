// Unit tests for services/cloudinaryService.js — a thin wrapper around the
// `cloudinary` SDK and `streamifier`. These tests verify the WRAPPER calls
// the SDK with the correct arguments and correctly propagates/normalizes
// results and errors — they do NOT exercise real Cloudinary uploads (the
// SDK is fully mocked, so no network calls are made).
const { PassThrough } = require('stream');

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

const cloudinary = require('cloudinary').v2;
const cloudinaryService = require('../../../services/cloudinaryService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cloudinaryService.uploadImage', () => {
  test('calls cloudinary.uploader.upload with resource_type:image merged with the given options', async () => {
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://res.cloudinary.com/demo/image/upload/foo.png' });

    const result = await cloudinaryService.uploadImage('data:image/png;base64,AAAA', { folder: 'avatars', transformation: [{ width: 200 }] });

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('data:image/png;base64,AAAA', {
      resource_type: 'image',
      folder: 'avatars',
      transformation: [{ width: 200 }],
    });
    expect(result).toEqual({ secure_url: 'https://res.cloudinary.com/demo/image/upload/foo.png' });
  });

  test('options passed in win over/merge with resource_type since they are spread after it', async () => {
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://example.com/x.png' });

    await cloudinaryService.uploadImage('data:image/png;base64,BBBB', { resource_type: 'raw' });

    // The source does { resource_type: 'image', ...options } — options.resource_type
    // (spread last) overrides the hardcoded 'image' default.
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('data:image/png;base64,BBBB', {
      resource_type: 'raw',
    });
  });

  test('works with no options provided', async () => {
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://example.com/y.png' });

    await cloudinaryService.uploadImage('data:image/png;base64,CCCC', undefined);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('data:image/png;base64,CCCC', {
      resource_type: 'image',
    });
  });

  test('propagates a rejection from the SDK', async () => {
    cloudinary.uploader.upload.mockRejectedValue(new Error('upload failed'));

    await expect(cloudinaryService.uploadImage('data:image/png;base64,DDDD', {})).rejects.toThrow('upload failed');
  });
});

describe('cloudinaryService.uploadBufferStream', () => {
  function mockUploadStreamWithPassthrough() {
    let capturedCallback;
    const passthrough = new PassThrough();
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      capturedCallback = callback;
      // Drain the piped-in data so the stream completes.
      passthrough.on('data', () => {});
      return passthrough;
    });
    return {
      getCallback: () => capturedCallback,
    };
  }

  test('pipes the buffer into the stream returned by upload_stream and resolves with the callback result', async () => {
    const { getCallback } = mockUploadStreamWithPassthrough();

    const buffer = Buffer.from('fake audio bytes');
    const options = { resource_type: 'video', folder: 'speaking' };
    const promise = cloudinaryService.uploadBufferStream(buffer, options);

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(options, expect.any(Function));

    // Simulate the Cloudinary SDK invoking its error-first callback on success.
    getCallback()(null, { secure_url: 'https://example.com/audio.mp3', duration: 5 });

    await expect(promise).resolves.toEqual({ secure_url: 'https://example.com/audio.mp3', duration: 5 });
  });

  test('rejects when the callback is invoked with an error', async () => {
    const { getCallback } = mockUploadStreamWithPassthrough();

    const promise = cloudinaryService.uploadBufferStream(Buffer.from('x'), {});

    getCallback()(new Error('stream upload failed'), null);

    await expect(promise).rejects.toThrow('stream upload failed');
  });
});

describe('cloudinaryService.uploadBufferAsDataUri', () => {
  test('builds a data URI from the buffer/mimetype and calls upload WITHOUT injecting resource_type', async () => {
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://example.com/qr.png' });

    const buffer = Buffer.from('qr-code-bytes');
    const options = { folder: 'qr-codes' };
    const result = await cloudinaryService.uploadBufferAsDataUri(buffer, 'image/png', options);

    const expectedDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(expectedDataUri, options);
    // NB: unlike uploadImage, uploadBufferAsDataUri does NOT merge in resource_type:'image' —
    // it passes `options` straight through unchanged. Confirm no extra key was injected.
    expect(cloudinary.uploader.upload.mock.calls[0][1]).toEqual({ folder: 'qr-codes' });
    expect(result).toEqual({ secure_url: 'https://example.com/qr.png' });
  });

  test('propagates a rejection from the SDK', async () => {
    cloudinary.uploader.upload.mockRejectedValue(new Error('bad data uri'));

    await expect(
      cloudinaryService.uploadBufferAsDataUri(Buffer.from('x'), 'image/jpeg', {})
    ).rejects.toThrow('bad data uri');
  });
});

describe('cloudinaryService.destroyAsset', () => {
  test('calls cloudinary.uploader.destroy with the given publicId', async () => {
    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    await cloudinaryService.destroyAsset('some/public/id');

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('some/public/id');
  });

  test('swallows a rejection from the SDK and resolves to undefined', async () => {
    cloudinary.uploader.destroy.mockRejectedValue(new Error('boom'));

    await expect(cloudinaryService.destroyAsset('missing/id')).resolves.toBeUndefined();
  });
});
