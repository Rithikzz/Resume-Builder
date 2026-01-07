import React from "react";
import { useParams } from "react-router-dom";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  return (
    <div style={{ padding: 16 }}>
      <h1>Resume Builder</h1>
      <p>Editing resume: <strong>{resumeId}</strong></p>
    </div>
  );
};

export default ResumeBuilder;
