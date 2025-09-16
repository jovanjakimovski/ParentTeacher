import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { FileService, UploadedFile } from '../file.service';

@Component({
  selector: 'app-file-uploads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-uploads.html',
  styleUrl: './file-uploads.css'
})
export class FileUploadsComponent {
  private authService = inject(AuthService);
  private fileService = inject(FileService);

  currentUser = this.authService.currentUser;
  uploadedFiles = this.fileService.getFiles();

  selectedFile: File | null = null;
  uploading = false;
  uploadError: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = null;
    }
  }

  async uploadFile(): Promise<void> {
    const user = this.currentUser();
    if (!this.selectedFile || !user) {
      this.uploadError = 'Please select a file to upload.';
      return;
    }

    this.uploading = true;
    this.uploadError = null;
    try {
      await this.fileService.uploadFile(this.selectedFile, user);
      this.selectedFile = null;
      // Reset the file input visually
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      this.uploadError = 'File upload failed. Please try again.';
    } finally {
      this.uploading = false;
    }
  }

  deleteFile(fileId: string): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(fileId);
    }
  }

  downloadFile(file: UploadedFile): void {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
