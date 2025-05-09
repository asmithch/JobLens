import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ResumeUpload.css';

function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const navigate = useNavigate();

  // Handle file drops for the resume
  const onDropResume = useCallback((acceptedFiles) => {
    setResumeFile(acceptedFiles[0]);
    setUploadMessage('');
  }, []);

  // Handle file drops for the job description
  const onDropJD = useCallback((acceptedFiles) => {
    setJdFile(acceptedFiles[0]);
    setUploadMessage('');
  }, []);

  // Setup dropzone hooks for the resume and job description
  const {
    getRootProps: getResumeRootProps,
    getInputProps: getResumeInputProps,
    isDragActive: isResumeDragActive,
  } = useDropzone({ onDrop: onDropResume });

  const {
    getRootProps: getJdRootProps,
    getInputProps: getJdInputProps,
    isDragActive: isJdDragActive,
  } = useDropzone({ onDrop: onDropJD });

  // Handle file upload and analysis
  const handleUpload = async () => {
    if (!resumeFile || !jdFile) {
      setUploadMessage('❗ Please upload both resume and job description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile); // Matching backend key
    formData.append('job_description', jdFile); // Matching backend key

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { match_percentage, missing_keywords } = response.data;
      setUploadMessage(`✅ Match: ${match_percentage}%\nMissing Keywords: ${missing_keywords.join(', ')}`);
    } catch (error) {
      console.error(error);
      setUploadMessage('❌ Failed to upload or analyze files.');
    }
  };

  return (
    <div className="page-container">
      <div className="content-card">
        <div className="header">
          <h1 className="title">JobLens: Smart Resume Analyzer</h1>
          <div className="nav-buttons">
            <button onClick={() => navigate('/')} className="nav-btn active">Home</button>
            <button onClick={() => navigate('/about')} className="nav-btn">About Us</button>
            <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          </div>
        </div>

        <div className="main-content">
          <p className="description">
            Upload your <strong>resume</strong> and the <strong>job description</strong> to get an AI-powered analysis of how well your profile matches the job!
          </p>

          {/* Resume Drop Zone */}
          <div {...getResumeRootProps()} className="drop-zone">
            <input {...getResumeInputProps()} />
            {isResumeDragActive ? <p>Drop your resume here...</p> : (
              <div className="dropzone-content">
                <i className="file-icon">📄</i>
                <p>Drag & drop your <strong>resume</strong> here, or click to select</p>
                <span className="supported-formats">Supported formats: PDF, DOCX</span>
              </div>
            )}
          </div>
          {resumeFile && <p className="file-info">📄 Resume: <span className="file-name">{resumeFile.name}</span></p>}

          {/* JD Drop Zone */}
          <div {...getJdRootProps()} className="drop-zone">
            <input {...getJdInputProps()} />
            {isJdDragActive ? <p>Drop job description here...</p> : (
              <div className="dropzone-content">
                <i className="file-icon">📃</i>
                <p>Drag & drop the <strong>job description</strong> here, or click to select</p>
                <span className="supported-formats">Supported formats: PDF, DOCX</span>
              </div>
            )}
          </div>
          {jdFile && <p className="file-info">📃 JD: <span className="file-name">{jdFile.name}</span></p>}

          {/* Upload & Analyze Button */}
          <button className="upload-btn" onClick={handleUpload}>Upload & Analyze</button>

          {/* Upload Message (Results) */}
          {uploadMessage && <pre className="upload-message">{uploadMessage}</pre>}
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
