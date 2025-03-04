import React from 'react';

const About = () => {
  return (
    <div>
      <h1>About This App</h1>
      <p className="my-1">
        This is a full stack React application for secure file sharing with end-to-end encryption
      </p>
      <p className="bg-dark p-1 my-1">
        <strong>Version: </strong> 1.0.0
      </p>
      <p className="p-1">
        Features:
        <ul className="list">
          <li>User authentication with JWT</li>
          <li>AES encryption for all files</li>
          <li>Self-destructing files after download</li>
          <li>File expiration dates</li>
          <li>Secure download links</li>
        </ul>
      </p>
    </div>
  );
};

export default About;