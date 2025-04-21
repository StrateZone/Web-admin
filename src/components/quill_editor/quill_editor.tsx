"use client"; // bắt buộc nếu bạn dùng Next.js App Router

import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface MyQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MyQuillEditor: React.FC<MyQuillEditorProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-lg">
      <ReactQuill value={value} onChange={onChange} theme="snow" />
    </div>
  );
};

export default MyQuillEditor;
