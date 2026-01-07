import React from "react";
import { useParams } from "react-router-dom";

const Preview = () => {
  const { resumeId } = useParams();
  return (
    <div style={{ padding: 16 }}>
      <h1>Preview</h1>
      <p>Previewing resume: <strong>{resumeId}</strong></p>
    </div>
  );
};

export default Preview;
