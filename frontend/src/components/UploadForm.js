import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job_description', jobDesc);

    try {
      const res = await axios.post('http://127.0.0.1:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResponse(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2 font-bold">Upload Resume and Job Description</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setResume(e.target.files[0])} accept=".pdf,.docx" required />
        <input type="file" onChange={(e) => setJobDesc(e.target.files[0])} accept=".pdf,.docx" required />
        <button type="submit">Analyze</button>
      </form>

      {response && (
        <div className="mt-4">
          <p><strong>Match %:</strong> {response.match_percentage}</p>
          <p><strong>Missing Keywords:</strong> {response.missing_keywords.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
