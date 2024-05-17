import React from 'react';

const AnswerDisplay = ({ answers }) => {
  return (
    <div className="textarea-container">
      <textarea
        rows="4"
        cols="50"
        value={answers || ''} readOnly
        className="answers-textarea"
      />
    </div>
  );
}

export default AnswerDisplay;
