
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Upload, CheckCircle, X, Paperclip } from 'lucide-react';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileUploadItemProps {
  label: string;
}

export function FileUploadItem({ label }: FileUploadItemProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup URL object when component unmounts or file changes
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
      
      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if(inputRef.current) {
        inputRef.current.value = '';
    }
  };
  
  const renderFileIcon = () => {
    if (preview) {
      return <Image src={preview} alt="Preview" width={40} height={40} className="rounded-md object-cover" />;
    }
    if(file) {
        if (file.type.includes('pdf')) {
            return <Paperclip className="text-red-500 flex-shrink-0"/>;
        }
        return <CheckCircle className="text-green-500 flex-shrink-0"/>;
    }
    return <Upload className="text-muted-foreground"/>;
  }

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
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                        {renderFileIcon()}
                    </div>
                    <div className='flex flex-col min-w-0'>
                        <Label className="font-semibold truncate">{file.name}</Label>
                        <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                </Button>
            </>
        )}
    </div>
  );
}

    