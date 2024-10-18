import React, { useEffect, useState } from "react";
import "./Home.css";
import FileUpload from "./FileUpload";
import SearchBar from "./SearchBar";
import AnswerDisplay from "./AnswerDisplay";
import { Link } from "react-router-dom";
import BarChart from "../DataViz/BarChart";
import WordCloud from "../DataViz/WordCloud";

function Home() {
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState("");
  const [visualization, setVisualization] = useState({});
  const [selectedArray, setSelectedArray] = useState(""); // Start as an empty string

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
    <div className="container">
      <h1 className="title">Social Justice Tool</h1>
      <FileUpload onFileChange={handleFileChange} onUpload={handleUpload} />

      {/* <SearchBar onSearch={handleSearch} />
      <AnswerDisplay answers={answers} /> */}

      <div>
        <button onClick={handleGenerateVisualization}>
          Generate Visualization
        </button>
      </div>

      <div>
        <h2>Filter Data</h2>
        {/* Dynamically generate dropdown options based on the visualization data */}
        <select value={selectedArray} onChange={handleArrayChange}>
          {Object.keys(visualization).map((sectionTitle) => (
            <option key={sectionTitle} value={sectionTitle}>
              {sectionTitle}
            </option>
          ))}
        </select>
      </div>

      <div>
        {/* Conditionally render visualizations for the selected section */}
        {visualization[selectedArray] && (
          <div>
            <BarChart data={visualization[selectedArray]} />
            <WordCloud data={visualization[selectedArray]} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
