import React, { useEffect, useState } from 'react';
import './Home.css';
import FileUpload from './FileUpload'
import SearchBar from './SearchBar'
import AnswerDisplay from './AnswerDisplay';
import { Link } from 'react-router-dom'
import BarChart from '../DataViz/BarChart';
import WordCloud from '../DataViz/WordCloud';




function Home() {
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState('');
  const [visualization, setVisualization] = useState({});
  const [selectedArray, setSelectedArray] = useState('CourseDescription'); 

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };
  
  const handleArrayChange = (event) => {
    setSelectedArray(event.target.value); // Update selected array when dropdown changes
  };
  const handleUpload = () => {
  if (file) {
    // Create a FormData object and append the file to it
    const formData = new FormData();
    formData.append('file', file);

    // Call the backend Django view to upload the file
    fetch('http://127.0.0.1:8000/api/upload/', {
      method: 'POST',
      body: formData,
      // No need to set Content-Type header, FormData will set it automatically
    })
    .then(response => {
      // Handle response from backend
      console.log('File uploaded successfully');
    })
    .catch(error => {
      // Handle error
      console.error('Error uploading file:', error);
    });
  } else {
    console.error('No file selected');
  }
};
const handleGenerateVisualization = () => {
  fetch(`http://127.0.0.1:8000/api/keywords`)
  .then(response => response.json())
  .then(data => {
    //console.log('Response from backend:', data); 
    setVisualization(data);
  console.log('Visualization:', visualization);});
}
const handleSearch = (searchTerm) => {
  console.log('Searching for:', searchTerm); // Log the search term

  fetch(`http://127.0.0.1:8000/api/search/?query=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      console.log('Response from backend:', data); // Log the response from the backend
      setAnswers(data.answer);
    })
    .catch(error => {
      console.error('Error searching:', error);
    });
}; 

  return (
    <div className="container">
      <h1 className="title">Social Justice Tool</h1>
      <FileUpload onFileChange={handleFileChange} onUpload={handleUpload} />
      
      {/* <SearchBar onSearch={handleSearch} />
      <AnswerDisplay answers={answers} /> */}
      <div>
        <button onClick={handleGenerateVisualization}>Generate Visualization</button>
      </div>

      <div>
        <h2>Filter Data</h2>
        {/* Dropdown to select between arrays */}
        <select value={selectedArray} onChange={handleArrayChange}>
          <option value="CourseDescription">Course Description</option>
          <option value="InstructorContact">Instructor Contact</option>
          <option value="ClassCommunications">Class Communications</option>
          <option value="CourseObjectives">Course Objectives</option>
          <option value="TeachingMethods">Teaching Methods</option>
          <option value="StudentLearningOutcomes">Student Learning Outcomes</option>
          <option value="Grading">Grading</option>
          <option value="AttendancePolicy">Attendance Policy</option>
        </select>
      </div>
      <div>
       
       
        {/* Conditionally pass the selected array */}
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
