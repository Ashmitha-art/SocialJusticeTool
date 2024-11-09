import React, { useState } from "react";

const FileUpload = ({ onFileChange, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    onFileChange(file); // Pass the selected file to the parent component
  };

  return (
    <div className="input-container">
      <input type="file" name="file" onChange={handleFileChange} />

      <button
        className="search-button"
        onClick={onUpload} // Directly call onUpload
        disabled={!selectedFile}
      >
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
