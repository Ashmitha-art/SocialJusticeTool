import React, { useState } from 'react';
import './App.css';
import FileUpload from './Components/Home/FileUpload'
import SearchBar from './Components/Home/SearchBar'
import AnswerDisplay from './Components/Home/AnswerDisplay';

function App() {
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
      <SearchBar onSearch={handleSearch} />
      <AnswerDisplay answers={answers} />
    </div>
  );
}

export default App;
