# Secure File Share

## Project Overview
Secure File Share is a full-stack web application for securely sharing files between users. It features robust encryption, user authentication, and secure file delivery via email with QR code support. The project is designed for both security and ease of use, making it suitable for enterprise and personal use cases.

---

## Features
- **User Authentication**: JWT-based login/registration with account lockout on repeated failures.
- **Secure File Upload**: Files are encrypted server-side before storage.
- **Direct Download via QR Code**: Recipients receive a QR code in their email; scanning it triggers a direct file download.
- **Decryption Key Delivery**: The decryption key is sent only to the intended recipient.
- **File Expiry & Auto-Destruction**: Files expire after 24 hours or after 3 failed download attempts.
- **SendGrid Email Integration**: All notifications and file delivery emails are sent via SendGrid.
- **Modern UI**: Built with React and Material-UI for a responsive, user-friendly experience.

---

## Technology Stack
- **Frontend**: React, Material-UI, Axios
- **Backend**: Node.js, Express, MongoDB (Atlas), Mongoose
- **Email Service**: SendGrid
- **File Handling**: Multer, CryptoJS (AES encryption)
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel (frontend & backend)

---

## Security Highlights
- AES-256 encryption for all files
- JWT authentication with 24-hour expiry
- Account lockout after 100 failed login attempts
- Files are auto-destroyed after 3 failed download attempts or 24 hours
- Decryption keys are never stored in plaintext or sent to the wrong user

---

## Deployment
- **Frontend**: [https://secure-file-share-dun.vercel.app/](https://secure-file-share-dun.vercel.app/)
- **Backend**: [https://securefileshare-backend.onrender.com](https://securefileshare-backend.onrender.com)
- **MongoDB**: Atlas
- **Email**: SendGrid (API key required in backend `.env`)

---

## Environment Variables
### Backend `.env` (example)
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=your_verified_sendgrid_sender_email
FRONTEND_URL=https://secure-file-share-dun.vercel.app
ENCRYPTION_KEY=your_encryption_key
```

### Frontend `.env` (example)
```
REACT_APP_API_URL=https://securefileshare-backend.onrender.com
```

---

## How It Works
1. **User registers and logs in.**
2. **User uploads a file and specifies the recipient's email.**
3. **File is encrypted and stored on the server.**
4. **Recipient receives an email (via SendGrid) with:**
   - Decryption key
   - Direct download link
   - QR code for direct download
5. **Recipient scans QR code or clicks link to download and decrypt the file.**
6. **File is auto-destroyed after 3 failed attempts or 24 hours.**

---

## Interview Questions
### General
- What is the main purpose of the Secure File Share project?
- Which technologies are used in the frontend and backend?
- How is user authentication handled?
- How are files secured during upload and download?
- What is the role of SendGrid in this project?

### Security
- How does the application ensure that only the intended recipient can access a file?
- What happens if a user enters the wrong decryption key multiple times?
- How are JWT tokens managed and validated?
- How is file encryption implemented?

### Architecture & Deployment
- How is the project deployed?
- What environment variables are required for deployment?
- How does the QR code feature work?

### Advanced
- How would you further improve the security of this application?
- How would you scale this application for thousands of users?
- What are the potential risks if the SendGrid API key is leaked?

---

## License
MIT