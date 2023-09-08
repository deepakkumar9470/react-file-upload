import React, { useState } from 'react';
import FileUpload from './FileUpload';
import {pdfjs } from 'react-pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import * as XLSX from 'xlsx';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Home = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [fileContents, setFileContents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
    setFileContents([]);
  };

  const handleSearchInputChange = (event) => {
    setSearchKeyword(event.target.value);
  };

 
  const readPdfFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const pdfData = await pdfjs.getDocument({ data }).promise;

    let pdfText = '';

    for (let pageNumber = 1; pageNumber <= pdfData.numPages; pageNumber++) {
      const page = await pdfData.getPage(pageNumber);
      const pageText = await page.getTextContent();
      const pageTextArray = pageText.items.map((item) => item.str);
      pdfText += pageTextArray.join(' ');
    }

    return pdfText;
  };

  const readExcelFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const excelText = sheetData.map((row) => row.join(' ')).join(' ');
    return excelText;
  };
  
  const handleFileContentExtraction = async () => {
    const contents = [];

    for (const file of uploadedFiles) {
      let fileText = '';

      if (file.type === 'application/pdf') {
        fileText = await readPdfFile(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        fileText = await readExcelFile(file);
      }

      contents.push({ name: file.name, text: fileText });
    }

    setFileContents(contents);
    console.log(contents)
  };



  const totalPages = Math.ceil(fileContents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedFiles = fileContents.slice(startIndex, endIndex);

  return (
    <div className="flex items-center justify-center flex-col mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-600">File Upload</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      
      <div className="w-[800px] flex items-center justify-center rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold">Search Files</h2>
        <input
          type="text"
          placeholder="Enter keywords to search"
          value={searchKeyword}
          onChange={handleSearchInputChange}
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleFileContentExtraction}
          className="w-[100px] mt-2 ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none">
         Extract
        </button>
      </div>

      {displayedFiles.length > 0 && (
        <div  className="mt-10">
          <h2 className="text-xl font-semibold text-center">Files and Sentences:</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Sentences Containing Keyword</th>
              </tr>
            </thead>
            <tbody>
              {displayedFiles.map((fileContent, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{fileContent.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {fileContent.text
                      .split('.')
                      .filter((sentence) =>
                        sentence.toLowerCase().includes(searchKeyword.toLowerCase())
                      )
                      .map((sentence, sentenceIndex) => (
                        <p key={sentenceIndex}>{sentence}</p>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
