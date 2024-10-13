import React, { useState } from "react";
import "./App.css";
import FileUpload from "./Components/Home/FileUpload";
import SearchBar from "./Components/Home/SearchBar";
import AnswerDisplay from "./Components/Home/AnswerDisplay";
import ChartDisplay from "./Components/Home/ChartDisplay"; // Import the new component

function App() {
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState("");

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
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      console.error("No file selected");
    }
  };

  const handleSearch = (searchTerm) => {
    fetch(`http://127.0.0.1:8000/api/search/?query=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
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
      <SearchBar onSearch={handleSearch} />
      <AnswerDisplay answers={answers} />

      {/* Render the new ChartDisplay component */}
      <ChartDisplay />
    </div>
  );
}

export default App;
