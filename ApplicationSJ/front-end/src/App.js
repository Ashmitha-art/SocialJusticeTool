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
  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/run_llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAnswers(data.result);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      setAnswers('Error retrieving the answer.');
    }
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
