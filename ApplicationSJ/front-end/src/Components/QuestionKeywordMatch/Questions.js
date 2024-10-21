
import React, { useEffect, useState } from 'react';



export default function Questions() {
    const [visualization, setVisualization] = useState({});
    const [file, setFile] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const questions = [
      { id: 1, text: "How is this course content relevant to students' lives?" },
      { id: 2, text: "How does this course content improve lives of individuals or communities?" },
      { id: 3, text: 'What are common challenges in marginalized communities?' }
    ];
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleUpload = () => {
      console.log('File:', file);
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
      const handleQuestionChange = (e) => {
        setSelectedQuestion(e.target.value);
      };
    

    const handleGenerateVisualization = () => {
        fetch(`http://127.0.0.1:8000/api/keywords`)
        .then(response => response.json())
        .then(data => {
          //console.log('Response from backend:', data); 
          setVisualization(data);
        console.log('Visualization:', visualization);});
      }
  return (
  
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Social Justice Questions Match</h1>
    
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload a text or PDF file</label>
            </div>
          {/* File Upload Section */}
          <div className="flex items-center space-x-4 mb-4">
 
          
            <input
              type="file"
              accept=".txt, .pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            
     
          <button
    onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    Upload
  </button>
  
          </div>
    
          {/* Question Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select a Question</label>
            <select
              value={selectedQuestion}
              onChange={handleQuestionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select a question</option>
              {questions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.text}
                </option>
              ))}
            </select>
          </div>
          
  <div className="flex justify-center mt-4">
    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
      Generate Visualization
    </button>
  </div>

          {selectedQuestion && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{selectedQuestion}</h2>
              {/* <BarChart question={selectedQuestion} /> */}
            </div>
          )}
        </div>
      );
  
}
