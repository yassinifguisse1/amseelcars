"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      {value && (
        <div className="relative group space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-input bg-muted">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={value.startsWith('https://utfs.io')}
              onError={(e) => {
                console.error("Image load error:", e);
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onChange("");
                  onRemove?.();
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground break-all">{value}</p>
        </div>
      )}

      {/* Upload Button */}
      {!value && (
        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Article Image</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 4MB
                </p>
              </div>
              <div className="w-full flex justify-center">
                <UploadButton
                  endpoint="imageUploader"
                  onUploadBegin={() => {
                    console.log("Upload started");
                    setIsUploading(true);
                  }}
                  onClientUploadComplete={(res) => {
                    console.log("Upload complete - full response:", JSON.stringify(res, null, 2));
                    // Uploadthing returns an array of files with url property
                    if (res && Array.isArray(res) && res.length > 0) {
                      const file = res[0];
                      // Try multiple possible URL properties
                      interface UploadthingFile {
                        url?: string;
                        ufsUrl?: string;
                        serverData?: { url?: string };
                      }
                      const imageUrl = file.url || file.ufsUrl || (file as UploadthingFile)?.serverData?.url;
                      console.log("Extracted URL:", imageUrl);
                      if (imageUrl) {
                        onChange(imageUrl);
                        setIsUploading(false);
                      } else {
                        console.error("No URL found in file object. Full file:", file);
                        alert("Upload completed but no URL found. Please check console.");
                        setIsUploading(false);
                      }
                    } else {
                      console.error("Invalid response format:", res);
                      alert("Upload response format is invalid. Please check console.");
                      setIsUploading(false);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                    alert(`Upload failed: ${error.message}`);
                    setIsUploading(false);
                  }}
                  className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:border-2 ut-button:border-input"
                  appearance={{
                    button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium border-2 border-input",
                    allowedContent: "ut-allowed-content:hidden",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual URL Input (Alternative) */}
      {!value && !isUploading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Or enter image URL manually:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/images/blog/example.webp or https://..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const url = manualUrl.trim();
                  if (url) {
                    onChange(url);
                    setManualUrl("");
                  }
                }
              }}
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              type="button"
              onClick={() => {
                const url = manualUrl.trim();
                if (url) {
                  onChange(url);
                  setManualUrl("");
                }
              }}
              disabled={!manualUrl.trim()}
              size="sm"
            >
              Use URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

