import React, { useState } from "react";
import * as d3 from "d3";
import * as d3Cloud from "d3-cloud";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";

const ChartDisplay = () => {
  const [imageSrc, setImageSrc] = useState(
    "/mnt/data/Screenshot 2024-10-12 at 1.06.29 PM.png"
  );

  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const createSvg = (title) => {
    const container = d3
      .select("#charts")
      .append("div")
      .attr("class", "chart-container");

    container.append("h3").attr("class", "chart-title").text(title);

    return container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  };

  const updateChart = (svg, data, scoreType) => {
    const x = d3.scaleBand().range([0, width]).padding(0.2);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map((d) => d.subheading));
    y.domain([0, 1]);

    svg.selectAll("*").remove();

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.subheading))
      .attr("y", (d) => y(d[scoreType]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[scoreType]))
      .attr("class", "bar");
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const chartData = jsonData.map((row) => ({
        subheading: row["subheading"],
        compound: row["compound"],
        pos: row["pos"],
        neu: row["neu"],
        neg: row["neg"],
      }));

      const compoundSvg = createSvg("Compound Sentiment Scores");
      updateChart(compoundSvg, chartData, "compound");

      const posSvg = createSvg("Positive Sentiment Scores");
      updateChart(posSvg, chartData, "pos");

      const neuSvg = createSvg("Neutral Sentiment Scores");
      updateChart(neuSvg, chartData, "neu");

      const negSvg = createSvg("Negative Sentiment Scores");
      updateChart(negSvg, chartData, "neg");
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();

    reader.onload = async function (e) {
      const arrayBuffer = e.target.result;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textContent = "";

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const text = await page.getTextContent();
        const pageText = text.items.map((item) => item.str).join(" ");
        textContent += pageText + " ";
      }

      generateWordCloud(textContent);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateWordCloud = (text) => {
    const wordsArray = text.split(/\s+/).reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const words = Object.entries(wordsArray).map(([word, count]) => ({
      text: word,
      size: Math.sqrt(count) * 20, // Adjust size scaling as needed
    }));

    const layout = d3Cloud()
      .size([500, 500]) // Set the square dimensions
      .words(words)
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .fontSize((d) => d.size)
      .on("end", drawWordCloud);

    layout.start();
  };

  const drawWordCloud = (words) => {
    const color = d3.scaleOrdinal(d3.schemeCategory10); // Set color scheme

    d3.select("#wordCloudContainer").select("svg").remove(); // Clear previous cloud

    const svg = d3
      .select("#wordCloudContainer")
      .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .append("g")
      .attr("transform", "translate(250,250)");

    svg
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => `${d.size}px`)
      .style("fill", (d, i) => color(i))
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .text((d) => d.text);
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.name.split(".").pop();
      if (fileType === "xlsx") {
        readExcelFile(file);
      } else if (fileType === "pdf") {
        extractTextFromPDF(file);
      }
    }
  };

  return (
    <div className="chart-section">
      <h2>Sentiment Analysis Bar Charts & Word Cloud</h2>

      {/* File input for Excel and PDF files */}
      <input type="file" accept=".xlsx,.pdf" onChange={handleFileInput} />
      <div style={{ marginTop: "20px" }}>
        {/* Placeholder for charts */}
        <div id="charts"></div>
      </div>
    </div>
  );
};

export default ChartDisplay;
