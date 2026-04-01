"use client";

import { useState } from 'react';
import { ExplorerPane } from './ExplorerPane';
import { FilePreview } from './FilePreview';


export default function ExplorerApp() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex w-full h-full bg-panel text-foreground overflow-hidden">
      {/* Left Sidebar (240px) */}
      <ExplorerPane onSelectFile={setSelectedFile} selectedFile={selectedFile} />
      
      {/* Right Panel (Flex 1) */}
      <FilePreview filePath={selectedFile} />
    </div>
  );
}
