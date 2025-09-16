import { Injectable, signal } from '@angular/core';
import { User } from './auth.service';

export interface UploadedFile {
  id: string;
  name: string;
  uploadedBy: string; // User's name
  role: 'Parent' | 'Teacher' | 'Admin';
  dataUrl: string; // In a real app, this would be a URL to the file on the server
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private filesKey = 'uploadedFiles';
  // Using a signal for modern Angular state management
  uploadedFiles = signal<UploadedFile[]>([]);

  constructor() {
    // Load files from local storage on service initialization
    const filesJson = localStorage.getItem(this.filesKey);
    if (filesJson) {
      this.uploadedFiles.set(JSON.parse(filesJson));
    }
  }

  getFiles() {
    return this.uploadedFiles;
  }

  uploadFile(file: File, uploader: User): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const newFile: UploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            uploadedBy: uploader.name,
            role: uploader.role,
            dataUrl: e.target.result as string,
            type: file.type,
          };

          this.uploadedFiles.update(files => [...files, newFile]);
          this.saveFilesToLocalStorage();
          resolve();
        } else {
          reject(new Error('Could not read file.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  deleteFile(fileId: string): void {
    this.uploadedFiles.update(files => files.filter(f => f.id !== fileId));
    this.saveFilesToLocalStorage();
  }

  private saveFilesToLocalStorage(): void {
    localStorage.setItem(this.filesKey, JSON.stringify(this.uploadedFiles()));
  }
}