import React, { useState } from 'react';
import './Home2.css';
import FileUpload from "./FileUpload";
import SectionOne from "./SectionOne";
import SectionTwo from "./SectionTwo";
import SectionThree from "./SectionThree";
import SectionFour from "./SectionFour";

function Home2() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [file, setFile] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false); // State for file upload
  const [isVisualizationGenerated, setIsVisualizationGenerated] =
    useState(false); 
    const [answers, setAnswers] = useState("");
    const [visualization, setVisualization] = useState({});
    const [selectedArray, setSelectedArray] = useState("");

const handleFileChange = (selectedFile) => {
        setFile(selectedFile);
      };
const handleUpload = () => {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
    
          fetch("http://127.0.0.1:8000/api/upload/", {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              console.log("File uploaded successfully");
              setIsFileUploaded(true); // Set file uploaded state to true
            })
            .catch((error) => {
              console.error("Error uploading file:", error);
            });
        } else {
          console.error("No file selected");
        }
      };
      const handleGenerateVisualization = () => {
        fetch(`http://127.0.0.1:8000/api/keywords`)
          .then((response) => response.json())
          .then((data) => {
            setVisualization(data);
    
            // Automatically select the first section when data is loaded
            const firstSection = Object.keys(data)[0];
            setSelectedArray(firstSection);
    
            console.log("Visualization:", data);
    
            setIsVisualizationGenerated(true); // Set visualization generated state to true
          });
      };

  return (
    <div className="app-container">
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '>' : '<'}
        </button>
        <h1 className="title">Social Justice Tool</h1>
        <FileUpload onFileChange={handleFileChange} onUpload={handleUpload} />

        <div>
          <button
            className="search-button"
            onClick={handleGenerateVisualization}
            disabled={!isFileUploaded} // Disable the button if no file is uploaded
          >
            Generate Visualization
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="visualization-grid">
          <div className="card">    <SectionOne /></div>
          <div className="card"><SectionTwo/></div>
          <div className="card"><SectionThree></SectionThree></div>
          <div className="card"><SectionFour/></div>
        </div>
      </div>
    </div>
  );
}

export default Home2;