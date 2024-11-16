import React, { useState } from "react";
import "./Home.css";
import FileUpload from "./FileUpload";

import SectionOne from "./SectionOne";
import SectionTwo from "./SectionTwo";
import SectionThree from "./SectionThree";
import SectionFour from "./SectionFour";

function Home() {
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState("");
  const [visualization, setVisualization] = useState({});
  const [selectedArray, setSelectedArray] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false); // State for file upload
  const [isVisualizationGenerated, setIsVisualizationGenerated] =
    useState(false); // State for visualization generation

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleArrayChange = (event) => {
    setSelectedArray(event.target.value); // Update selected array when dropdown changes
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

  const handleSearch = (searchTerm) => {
    console.log("Searching for:", searchTerm);

    fetch(`http://127.0.0.1:8000/api/search/?query=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data);
        setAnswers(data.answer);
      })
      .catch((error) => {
        console.error("Error searching:", error);
      });
  };

  return (
    <div>
      <div className="container">
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

      {/* Right column only displays after both conditions are met */}
      {isFileUploaded && isVisualizationGenerated && (
        <div className="right-container">
          <div className="right-column">
            <div className="box">
              <SectionOne />
            </div>
            <div className="box">
              <SectionTwo />
            </div>
            <div className="box">
              <SectionThree />
            </div>
            <div className="box">
              <SectionFour />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
