import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/files")
      .then(response => {
        setFiles(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching files:", error);
        setLoading(false);
      });
  }, []);

  const totalFiles = files.length;
  const totalDownloads = files.reduce((acc, file) => acc + file.downloadCount, 0);
  const totalSize = files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024); // in MB
  
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">File Management Dashboard</h1>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="stats-grid">
          <div className="card">
            <h2>Total Files</h2>
            <p>{totalFiles}</p>
          </div>
          <div className="card">
            <h2>Total Downloads</h2>
            <p>{totalDownloads}</p>
          </div>
          <div className="card">
            <h2>Total Storage Used</h2>
            <p>{totalSize.toFixed(2)} MB</p>
          </div>
        </div>
      )}
      <table className="file-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Downloads</th>
            <th>Max Downloads</th>
            <th>Expires At</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file._id}>
              <td>{file.originalName}</td>
              <td>{file.downloadCount}</td>
              <td>{file.maxDownloads}</td>
              <td>{new Date(file.expiresAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
