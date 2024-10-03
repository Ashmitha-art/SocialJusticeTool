import React, { useState } from 'react';

const FileUpload = ({ onFileChange, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    onFileChange(event.target.files[0]);
  };

  const handleUpload = () => {
    onUpload(selectedFile);
  };

  return (
    <div className="input-container">
      <input type="file" name="file" onChange={handleFileChange}/>
      <button className="search-button" onClick={handleUpload} disabled={!selectedFile}>
      Upload
      </button>
    </div>
  );
};

export default FileUpload;
