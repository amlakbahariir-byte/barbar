
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  id: string;
  currentImage: string | null;
  onImageChange: (url: string | null) => void;
  placeholderIcon: React.ReactNode;
  className?: string;
  isAvatar?: boolean;
}

export function ImageUpload({
  id,
  currentImage,
  onImageChange,
  placeholderIcon,
  className,
  isAvatar = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPreview(currentImage);

    // Cleanup function to revoke object URL
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
    // We only want to run this when the *initial* currentImage prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Simple validation for image type
      if (!file.type.startsWith('image/')) {
        toast({
            title: 'فایل نامعتبر',
            description: 'لطفا یک فایل تصویری انتخاب کنید.',
            variant: 'destructive',
        });
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageChange(objectUrl); // Pass the blob URL up to the parent
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering the upload click
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onImageChange(null);
    if (inputRef.current) {
        inputRef.current.value = ''; // Reset the file input
    }
  };

  return (
    <div
      className={cn(
        'relative group bg-secondary border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden',
        isAvatar && 'rounded-full',
        preview && 'border-solid',
        className
      )}
      onClick={handleUploadClick}
    >
      <input
        id={id}
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {preview ? (
        <>
          <Image
            src={preview}
            alt="پیش‌نمایش تصویر"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="size-8 text-white" />
          </div>
           <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={handleRemoveImage}
           >
              <X className="size-4" />
              <span className="sr-only">حذف تصویر</span>
            </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {placeholderIcon}
          <span className="text-xs text-center">انتخاب عکس</span>
        </div>
      )}
    </div>
  );
}
