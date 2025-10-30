import React, { useEffect,useState } from "react";
import DotPlotChart from "../DataViz/DotPlotChart";


function SectionTwo() {
  // State to store the data from the API
  const [chartData, setChartData] = useState([]);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track errors
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/dotplot/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // The data from the API is already in the correct format
        setChartData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Render loading state
  if (loading) {
    return <div>Loading chart data...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error loading chart data: {error}</div>;
  }

  return (
    <div>
      {chartData.length > 0 ? (
        <DotPlotChart initialData={chartData} />
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}


export default SectionTwo;
