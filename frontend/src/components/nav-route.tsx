import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import {
  Upload,
  X,
  FileVideo,
  type LucideIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavRoutesProps {
  pages: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  onFileSelect?: (file: File) => void
  maxSizeInMB?: number
}

export function NavRoutes({
  pages,
  onFileSelect,
  maxSizeInMB = 30
}: NavRoutesProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  const acceptedTypes = "video/mp4,video/avi,video/mov,video/wmv,video/webm";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Gets the first file selected
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError("Please select a valid video file (MP4, AVI, MOV, WMV, WebM)");
      return;
    }

    // Checks if file size is exceeding the max size MB allowed, and if it is, send an error
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File size must be less than ${maxSizeInMB}MB`);
      return;
    }

    setError("");
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      
      
      // Reset state
      setSelectedFile(null);
      setIsDialogOpen(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to clear the file selected 
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to help display the file's size when a file is being selected for upload
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col gap-5">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="text-primary-foreground px-4 py-2 items-center justify-center whitespace-nowrap rounded-md h-15 text-md flex gap-4 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90 font-bold">
          <Upload className="size-5"/> Upload Video
        </DialogTrigger>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Video</DialogTitle>
            <DialogDescription>
              Select a video file to upload. Max size: {maxSizeInMB}MB
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-5">
            {/* Selected File Display */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileVideo className="size-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="size-6" />
                  </Button>
                )}
              </div>
            )}

            {/* File Input */}
            <div className="">
              
              <Input
                id="video-upload"
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <SidebarMenu className="flex flex-col gap-2">
        {pages.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild className={`h-13 text-md flex gap-5 rounded-md px-3 py-2 transition-all ${
              currentPath === item.url 
                ? 'bg-darkPurple/20 text-darkBLue backdrop-blur-3xl font-semibold border-1 border-darkPurple/20 dark:border-darkPurple/40 hover:bg-darkPurple/25' 
                : 'hover:bg-gray-300/30 hover:dark:bg-darkPurple/20'
            }`}>
              <a href={item.url}>
                <item.icon className="!w-5 !h-5"/>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}