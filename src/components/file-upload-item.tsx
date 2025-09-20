
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Upload, CheckCircle, X, Paperclip, File as FileIcon } from 'lucide-react';
import { Label } from './ui/label';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

interface FileUploadItemProps {
  label: string;
}

export function FileUploadItem({ label }: FileUploadItemProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      setUploadProgress(0); // Start simulation

      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
      } else {
        setPreview(null);
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isUploading = uploadProgress !== null && uploadProgress < 100;
  const isUploadComplete = uploadProgress === 100;

  return (
    <div className={cn(
        "flex flex-col p-3 rounded-lg border-2 border-dashed bg-card transition-all",
        !file ? "border-muted hover:border-primary" : "border-transparent",
        isUploading ? "border-primary/50" : "",
        isUploadComplete ? "border-green-500/50" : ""
    )}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, application/pdf"
      />
      
      {!file ? (
        <button type="button" onClick={handleUploadClick} className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="font-semibold">{label}</span>
            <span className="text-xs text-muted-foreground">برای بارگذاری کلیک کنید</span>
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-muted">
            {preview ? (
              <Image src={preview} alt="Preview" width={48} height={48} className="rounded-md object-cover h-full w-full" />
            ) : (
              <FileIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB - {isUploadComplete ? <span className="text-green-600">کامل شد</span> : 'در حال آپلود...'}
            </p>
            {(uploadProgress !== null) && (
              <Progress value={uploadProgress} className="h-1 mt-1" />
            )}
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0" onClick={handleRemoveFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

    