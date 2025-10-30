import React, { useState } from 'react';
import { Upload, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file) => {
    if (!file) return false;
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'pdf') {
      setFileError('Please upload a PDF file only');
      return false;
    }
    
    setFileError('');
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile); // Store the actual file object
        setFileName(selectedFile.name);
      } else {
        setFile(null);
        setFileName('');
      }
    }
  };
  const handleOnSend = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('No file selected. Please upload a PDF file.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
  
      // Upload file
      const uploadResponse = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      console.log("File uploaded successfully", uploadData);
      
      // You could make additional API calls here
      // For example, to process the uploaded file
      
      const analysisResponse = await fetch(`http://127.0.0.1:8000/api/keywords`, {
        method: "GET"
      });
      
      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed with status: ${analysisResponse.status}`);
      }
      
      const analysisData = await analysisResponse.json();
      console.log("File analysis completed", analysisData);
      
      // Make sure we only proceed if both upload and analysis were successful
      if (uploadResponse.ok && analysisResponse.ok) {
        // Set upload as successful
        setIsFileUploaded(true);
        
        // Navigate to review page ONLY if everything was successful
        window.location.href = '/review';
      } else {
        throw new Error("File was uploaded but processing failed");
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      setFileError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Navigation */}
      <nav className="py-4 px-6 lg:px-12 flex justify-between items-center">
       
        <div className="hidden md:flex space-x-8">
          <button className="text-gray-600 hover:text-indigo-700 transition-colors">About</button>
          <button className="text-gray-600 hover:text-indigo-700 transition-colors">Features</button>
          <button className="text-gray-600 hover:text-indigo-700 transition-colors">Contact</button>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors hidden md:block">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
          Social Justice <span className="text-indigo-600">Syllabus Tool</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          Upload your syllabus to analyze and enhance social justice perspectives in your curriculum
        </p>

        {/* File Upload Area */}
        <div 
          className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 mb-8 flex flex-col items-center justify-center transition-colors`}
    
        >
          <Upload size={48} className="text-indigo-500 mb-4" />
          <p className="text-gray-700 mb-4 font-medium">
            {fileName ? `File selected: ${fileName}` : 'Drag & drop your syllabus here'}
          </p>
          {fileError && <p className="text-red-500 text-sm mb-2">{fileError}</p>}
          <p className="text-gray-500 text-sm mb-6">
            {!fileName && 'or'}
          </p>
          <label className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer mb-4">
            Browse File
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </label>
          
          <button 
  disabled={!file || isUploading} 
  onClick={handleOnSend}
  className={`flex items-center px-6 py-3 rounded-md transition-colors ${
    file 
      ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer" 
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {isUploading ? 'Uploading...' : 'Send for Analysis'}
  {!isUploading && <ArrowRight className="ml-2" size={18} />}
</button>
          
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Analysis</h3>
            <p className="text-gray-600">Analyze your syllabus for social justice themes and representation</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Visual Insights</h3>
            <p className="text-gray-600">Get meaningful visualizations and metrics on course materials</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommendations</h3>
            <p className="text-gray-600">Receive suggestions to enhance inclusivity in your course</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Social Justice Syllabus Tool</p>
      </footer>
    </div>
  );
};

export default LandingPage;