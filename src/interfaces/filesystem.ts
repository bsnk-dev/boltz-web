export interface FileSystem {
  name: string;
  root: FileSystemDirectoryEntry;
}

export interface FileSystemEntry {
  readonly filesystem: FileSystem;
  readonly fullPath: string;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly name: string;
}

export interface FileSystemFileEntry extends FileSystemEntry {
  file(resolve: Function, reject?: Function): File;
}

export interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader(): FileSystemDirectoryReader;
  getDirectory(path: string): FileSystemDirectoryEntry;
  getFile(path: string): FileSystemFileEntry;
}

export interface FileSystemDirectoryReader {
  readEntries(resolve: Function, reject?: Function): Array<FileSystemFileEntry | FileSystemDirectoryEntry> ;
}
