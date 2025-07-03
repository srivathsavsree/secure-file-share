const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

const decrypt = (text) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

const encryptFile = (buffer) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

const decryptFile = (encryptedBuffer) => {
  try {
    const iv = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);
    const decipher = crypto.createDecipher(algorithm, key);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted;
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  generateToken,
  hashData
};
