import React, { useEffect, useState } from 'react';
import './Home.css';
import FileUpload from './FileUpload'
import SearchBar from './SearchBar'
import AnswerDisplay from './AnswerDisplay';
import { Link } from 'react-router-dom'




function Home() {
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState('');

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
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
        <h2>View Visualization</h2>
        <ul>
          <li><Link to="/wordcloud"> Word Cloud</Link></li>
          <li><Link to="/barchart"> Bar Chart </Link></li>
      
        </ul>
        </div>
    </div>
  );
}

export default Home;
