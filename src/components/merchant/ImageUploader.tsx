import { useState, useRef, useCallback } from "react";
import { Upload, Link, Clipboard, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export function ImageUploader({ 
  currentImageUrl, 
  onImageChange,
  bucket = "shop-images",
  folder = ""
}: ImageUploaderProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"preview" | "url" | "upload">("preview");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("merchant.invalidImageType"));
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("merchant.imageTooLarge"));
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("auth.signInRequired"));
        setUploading(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      setMode("preview");
      toast.success(t("merchant.imageUploaded"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("merchant.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, onImageChange, t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadFile(file);
        }
        return;
      }
    }
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput("");
      setMode("preview");
      toast.success(t("merchant.imageUrlSet"));
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      {currentImageUrl && mode === "preview" && (
        <div className="relative rounded-xl overflow-hidden h-40 bg-secondary group">
          <img
            src={currentImageUrl}
            alt="Shop preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {mode === "upload" && (
        <div
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative rounded-xl border-2 border-dashed h-40 flex flex-col items-center justify-center gap-2 transition-all",
            dragOver ? "border-primary bg-primary/5" : "border-border",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("merchant.uploading")}</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center px-4">
                {t("merchant.dropOrPaste")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {t("merchant.chooseFile")}
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input */}
      {mode === "url" && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
            {t("merchant.apply")}
          </Button>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => setMode("upload")}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          {t("merchant.upload")}
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => setMode("url")}
        >
          <Link className="h-4 w-4 mr-1.5" />
          {t("merchant.url")}
        </Button>
      </div>
    </div>
  );
}
