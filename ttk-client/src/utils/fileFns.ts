import { generateUniqueId } from './uniqueId';

export class FileFns {
  static base64ToBlob(base64: string) {
    const base64Content = base64.split(',')[1];

    // Get the content type from the base64 prefix
    const contentType = base64.split(',')[0].split(':')[1].split(';')[0];

    const sliceSize = 1024;
    const byteChars = window.atob(base64Content);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
      const slice = byteChars.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return {
      blob: new Blob(byteArrays, { type: contentType }),
      contentType,
    };
  }

  static base64ToFile(base64: string, filename: string) {
    const { blob, contentType } = this.base64ToBlob(base64);
    return new File([blob], filename, { type: contentType, lastModified: Date.now() });
  }

  static blobToFile(blob: Blob, filename: string) {
    return new File([blob], filename, { lastModified: Date.now() });
  }

  static base64ToFileUrl(content: string, type: string) {
    return `data:${type};base64,${content}`;
  }

  static getFileExtension(file: File) {
    return file.name.split('.').pop();
  }

  static getFileNameFromUrl(url: string) {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  static generateImgFileName(file: File, extension: string) {
    return file.name.split('.')[0] + '.' + extension;
  }

  static generateUniqueFileName(extension: string) {
    return [generateUniqueId(), extension].join('.');
  }

  static isLocalFile(url: string) {
    return url.startsWith('blob');
  }

  static blobToDataUrl = (blob: File) =>
    new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  static readFile(file: File) {
    const fileReader = new FileReader();

    return new Promise<string | ArrayBuffer | null | undefined>((res) => {
      fileReader.onloadend = (ev) => res(ev.target?.result);
      fileReader.readAsText(file);
    });
  }

  static fileToBase64(file: File) {
    const fileReader = new FileReader();

    return new Promise<string | ArrayBuffer | null | undefined>((res) => {
      fileReader.onloadend = (ev) => res(ev.target?.result);
      fileReader.readAsDataURL(file);
    });
  }

  static downloadBase64(url: string, filename: string) {
    // Create a hidden anchor element
    var a = document.createElement('a');
    (a as any).style = 'display: none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  static downloadFile(file: File) {
    var url = URL.createObjectURL(file);

    var a = document.createElement('a');
    (a as any).style = 'display: none';
    a.href = url;
    a.download = file.name;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  static async objectUrlToFile(url: string, filename: string) {
    const res = await fetch(url);
    const blobObject = await res.blob();
    return this.blobToFile(blobObject, filename);
  }
}
