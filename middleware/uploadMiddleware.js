import multer from 'multer';

const storage = multer.memoryStorage();

// Image upload filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// CV/PDF upload filter
const cvFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Please upload a PDF file.'), false);
  }
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadCV = multer({ storage, fileFilter: cvFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export default upload;
