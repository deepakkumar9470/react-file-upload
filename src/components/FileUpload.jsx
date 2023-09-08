import React, { useState,useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const acceptedFileTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
];

const FileUpload = ({ onFileUpload }) => {
  const [uploadedFileName, setUploadedFileName] = useState('');
  const onDrop = useCallback(
    (acceptedFiles) => {
      const files = acceptedFiles.filter(
        (file) => acceptedFileTypes.includes(file.type)
      );
      if (files.length > 0) {
        const firstFile = files[0];
        setUploadedFileName(firstFile.name);
        onFileUpload(files);
      } else {
        alert('Invalid file type. Please upload a PDF, Excel, or Word file.');
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.join(','),
  });

  return (
    <div className="h-20 border border-dashed border-gray-300 p-4 rounded-md mt-4">
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      {uploadedFileName ? (
          <p className="text-center text-gray-600">{uploadedFileName}</p>
        ) : (
          <p className="text-center text-gray-600">
            Drag and drop files here, or click to select files
          </p>
        )}
    </div>
  </div>
  );
};

export default FileUpload;
