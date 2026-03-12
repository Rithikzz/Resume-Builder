import ImageKit from '@imagekit/nodejs';

let _imagekit = null;

const getImageKit = () => {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    });
  }
  return _imagekit;
};

export default getImageKit;