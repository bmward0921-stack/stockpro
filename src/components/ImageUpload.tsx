import { useState, useRef } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const ImageUpload = ({ value, onChange, className }: ImageUploadProps) => {
  const [urlInput, setUrlInput] = useState(value);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, error } = useStorage();

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    try {
      const url = await uploadFile(file);
      onChange(url);
      setUrlInput(url);
    } catch (err) {
      // Error is handled in useStorage hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    onChange(urlInput);
  };

  const handleRemoveImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label>Product Image</Label>

      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={value}
              alt="Product preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-8 w-8"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link className="mr-2 h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3">
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors',
                dragActive && 'border-primary bg-primary/5',
                uploading && 'pointer-events-none opacity-50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
                disabled={uploading}
              />

              {uploading ? (
                <>
                  <Loader2 className="mb-3 h-10 w-10 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                </>
              )}
            </div>

            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-3">
            <div className="flex gap-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput}>
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ImageUpload;
