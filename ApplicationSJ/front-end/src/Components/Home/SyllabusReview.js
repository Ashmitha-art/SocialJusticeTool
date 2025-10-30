import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, ArrowLeft } from 'lucide-react';
import Heatmap from './HeatMap';
import SectionTwo from './SectionTwo';
import SectionThree from './SectionThree';
import SectionFour from './SectionFour';
import SentimentGraph from '../DataViz/SentimentGraph';

const SyllabusReview = () => {
  // Sample data (you'll replace with actual data from your backend)
  const syllabusData = {
    title: "",
    wordCount: 1234,
    fileName: "file1.pdf"
  };

  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    1: true, // Set the first section to be expanded by default
    2: true,
    3: true,
    4: true,
    5: true
  });

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Collapsible section data
  const sections = [
    { id: 1, title: "Inclusion & Diversity Metrics" },
    { id: 2, title: "Reading List Representation Analysis" },
    { id: 3, title: "Language Pattern & Terminology Usage" },
    { id: 4, title: "Topic Distribution & Coverage" },
    { id: 5, title: "Accessibility & Accommodations Assessment" }
  ];
  
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

      {/* Main content */}
      <div className="flex-1 px-6 lg:px-12 py-8 max-w-full mx-auto w-full" style={{ maxWidth: "95%" }}>
        {/* Back button */}
        <button 
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Upload
        </button>

        {/* Syllabus header card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <FileText size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{syllabusData.title}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">File:</span> {syllabusData.fileName}
                </p>
                {/* <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Word Count:</span> 
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis results */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>
        
        {/* Collapsible sections */}
        <div className="space-y-4">
 

          {/* Section 1 */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Section header */}
            <button 
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggleSection(1)}
            >
              <h3 className="text-lg font-medium text-gray-800">Emotion Analysis</h3>
              {expandedSections[1] ? 
                <ChevronUp size={20} className="text-gray-500" /> : 
                <ChevronDown size={20} className="text-gray-500" />
              }
            </button>
            
            {/* Collapsible content */}
            {expandedSections[1] && (
              <div className="p-4 border-t border-gray-200">
                <div className="rounded-lg w-full h-[600px] flex items-center justify-center text-gray-500" id="barChart">
                  <SectionTwo />
                </div>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Section header */}
            <button 
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggleSection(2)}
            >
              <h3 className="text-lg font-medium text-gray-800">Word Cloud Analysis</h3>
              {expandedSections[2] ? 
                <ChevronUp size={20} className="text-gray-500" /> : 
                <ChevronDown size={20} className="text-gray-500" />
              }
            </button>
            
            {/* Collapsible content */}
            {expandedSections[2] && (
              <div className="p-4 border-t border-gray-200">
                <div className="rounded-lg w-full h-[600px] flex items-center justify-center text-gray-500" id="wordCloud">
                  <SectionThree />
                </div>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Section header */}
            <button 
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggleSection(3)}
            >
              <h3 className="text-lg font-medium text-gray-800">Social Justice Themes Network Graph</h3>
              {expandedSections[3] ? 
                <ChevronUp size={20} className="text-gray-500" /> : 
                <ChevronDown size={20} className="text-gray-500" />
              }
            </button>
            
            {/* Collapsible content */}
            {expandedSections[3] && (
              <div className="p-4 border-t border-gray-200">
                <div className="rounded-lg w-full h-[600px] flex items-center justify-center text-gray-500" id="pieChart">
                  <SectionFour />
                </div>
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Section header */}
            <button 
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggleSection(4)}
            >
              <h3 className="text-lg font-medium text-gray-800">Sentiment Analysis</h3>
              {expandedSections[4] ? 
                <ChevronUp size={20} className="text-gray-500" /> : 
                <ChevronDown size={20} className="text-gray-500" />
              }
            </button>
            
            {/* Collapsible content */}
            {expandedSections[4] && (
              <div className="p-4 border-t border-gray-200">
                <div className=" rounded-lg w-full h-[600px] flex items-center justify-center text-gray-500" id="radarChart">
              <SentimentGraph />
                </div>
              </div>
            )}
          </div>

                 {/* Section 5 */}
                 <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Section header */}
            <button 
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggleSection(5)}
            >
              <h3 className="text-lg font-medium text-gray-800">Heatmap</h3>
              {expandedSections[5] ? 
                <ChevronUp size={20} className="text-gray-500" /> : 
                <ChevronDown size={20} className="text-gray-500" />
              }
            </button>
            
            {/* Collapsible content */}
            {expandedSections[5] && (
              <div className="p-4 border-t border-gray-200">
                <div className="rounded-lg w-full h-[600px] flex items-center justify-center text-gray-500" id="heatmap">
                  <Heatmap />
                </div>
              </div>
            )}
          </div>
        </div>

        
        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors">
            Download Full Report
          </button>
          <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition-colors">
            Upload Another Syllabus
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-gray-500 text-sm mt-8">
        <p>© {new Date().getFullYear()} Social Justice Syllabus Tool</p>
      </footer>
    </div>
  );
};

export default SyllabusReview;