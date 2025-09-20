
'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, CheckCircle, X, Paperclip } from 'lucide-react';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface FileUploadItemProps {
  label: string;
}

export function FileUploadItem({ label }: FileUploadItemProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if(inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, application/pdf"
        />
        
        {!file ? (
            <>
                <div className='flex items-center gap-3'>
                    <Upload className="text-muted-foreground"/>
                    <Label className="font-semibold">{label}</Label>
                </div>
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                    <Upload className="ml-2 h-4 w-4"/>
                    بارگذاری
                </Button>
            </>
        ) : (
            <>
                 <div className='flex items-center gap-3 min-w-0'>
                    <CheckCircle className="text-green-500 flex-shrink-0"/>
                    <div className='flex flex-col min-w-0'>
                        <Label className="font-semibold truncate">{file.name}</Label>
                        <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                </Button>
            </>
        )}
    </div>
  );
}
