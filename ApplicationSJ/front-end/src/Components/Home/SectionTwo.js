import React from "react";
import DotPlotChart from "../DataViz/DotPlotChart";


function SectionTwo() {

  return (
   
     <DotPlotChart initialData={initialData}/>


  );
}

export default SectionTwo;
// Sample data array for the DotPlot Chart
const initialData = [
  {
    state: "Section A",
    trust: 0.52,
    trust_count: 150,
    joy: 0.45,
    joy_count: 120,
    fear: 0.28,
    fear_count: 80,
    surprise: 0.35,
    surprise_count: 95,
    senti_positive_count: 180,
    senti_negative_count: 60,
    senti_neutral_count: 40
  },
  {
    state: "Section B",
    trust: 0.48,
    trust_count: 130,
    anger: 0.32,
    anger_count: 85,
    joy: 0.38,
    joy_count: 100,
    sadness: 0.25,
    sadness_count: 70,
    senti_positive_count: 160,
    senti_negative_count: 75,
    senti_neutral_count: 45
  },
  {
    state: "Section C",
    trust: 0.55,
    trust_count: 160,
    anticipation: 0.42,
    anticipation_count: 110,
    joy: 0.51,
    joy_count: 140,
    disgust: 0.18,
    disgust_count: 50,
    senti_positive_count: 200,
    senti_negative_count: 45,
    senti_neutral_count: 35
  },
  {
    state: "Section D",
    trust: 0.45,
    trust_count: 125,
    fear: 0.35,
    fear_count: 95,
    surprise: 0.41,
    surprise_count: 115,
    joy: 0.43,
    joy_count: 120,
    senti_positive_count: 170,
    senti_negative_count: 65,
    senti_neutral_count: 45
  },
  {
    state: "Section E",
    trust: 0.51,
    trust_count: 145,
    anger: 0.28,
    anger_count: 75,
    joy: 0.47,
    joy_count: 130,
    sadness: 0.22,
    sadness_count: 60,
    senti_positive_count: 190,
    senti_negative_count: 50,
    senti_neutral_count: 40
  }
];

export { initialData };


