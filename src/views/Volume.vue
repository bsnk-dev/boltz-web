<template>
  <div>
    <div
      class="
        justify-content-between
        flex-wrap flex-md-nowrap
        pt-3
        pb-2
        mb-3
        border-bottom
      "
      v-if="loaded"
    >
      <h1 class="h2">{{ volume.name }}</h1>
      <article class="fs-6" style="opacity: 0.8">
        {{ volume._id }}
      </article>
    </div>

    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li
          class="breadcrumb-item"
          v-for="breadcrumb in currentDirectoryBreadcrumbs"
          :key="breadcrumb.path"
        >
          <a
            v-if="breadcrumb.path != currentDirectory"
            @click="
              () => {
                currentDirectory = breadcrumb.path;
                currentDirectoryListing = listDirectory();
              }
            "
            class="link-primary"
          >
            {{ breadcrumb.name }}
          </a>

          <span v-else class="breadcrumb-item active">
            {{ breadcrumb.name }}
          </span>
        </li>
      </ol>
    </nav>

    <div class="d-flex align-items-center">
      <button class="btn btn-primary me-2" @click="createFile()">
        <i class="bi-plus fs-6"></i>
        New File
      </button>
      <button class="btn btn-light me-2" @click="createFolder()">
        <i class="bi-plus fs-6"></i>
        New Folder
      </button>
      <button
        class="btn btn-light me-2"
        :disabled="selected.length > 1 || !selected.length"
        @click="renameFile(selected[0])"
      >
        <i class="bi-pencil-square fs-6"></i>
        Rename
      </button>
      <button
        class="btn btn-light text-danger"
        :disabled="!selected.length"
        @click="deleteFiles()"
      >
        <i class="bi-trash fs-6"></i>
        Delete
      </button>
    </div>

    <div
      class="table-responsive"
      @drop="dropHandler($event)"
      @dragover="$event.preventDefault()"
    >
      <table
        class="
          table table-striped table-hover table-bordered-curved table-borderless
        "
        v-if="loaded"
      >
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file of this.currentDirectoryListing"
            :key="file.name"
            :class="selected.includes(file) ? 'bg-primary text-white' : ''"
            @click="selectionHandler($event, file)"
            @dblclick="doubleClickHandler($event, file)"
          >
            <td></td>
            <td>{{ file.name }}</td>
            <td>
              <template v-if="!isFolder(file)">
                {{ file.name.split(".").reverse()[0].toUpperCase() }}
              </template>
              <template v-else> FOLDER </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { VolumeI } from '@/interfaces/instances';
import RefreshAppInfo from '@/mixins/refreshAppInfo.vue';
import {FileSystemFileEntry, FileSystemDirectoryEntry, FileSystemDirectoryReader} from '@/interfaces/filesystem';
import {Component, Mixins} from 'vue-property-decorator';
import { vol as Vol, Volume as FSVolume } from 'memfs';
import authFetch from '@/utilities/authFetch';
import Dirent from 'memfs/lib/Dirent';
import { TDataOut } from 'memfs/lib/encoding';

@Component
export default class Volume extends Mixins(RefreshAppInfo) {
  loaded = false;
  volume!: VolumeI;

  fs!: typeof Vol;

  currentDirectory = '/';
  currentDirectoryListing: Dirent[] = [];

  selected: Dirent[] = [];

  listDirectory(): TDataOut[] | Dirent[] {
    return this.fs.readdirSync(this.currentDirectory, { withFileTypes: true });
  }

  get currentDirectoryBreadcrumbs(): { name: string, path: string}[] {
    const paths = this.currentDirectory.split('/');

    paths[0] = '/';
    
    let pathsFull: { name: string, path: string}[] = [];

    for (let i = 0; i < paths.length; i++) {
      pathsFull.push({
        name: paths[i],
        path: paths.slice(0, i + 1).join('/').slice(1)
      });
    }

    pathsFull[0].name = 'root';

    return pathsFull;
  }

  async getFullVolume(volumeID: string): Promise<VolumeI | null> {
    const res = await authFetch(`${this.$store.state.adminAPIURL}/admin/getVolume?id=${volumeID}`);
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json;
  }

  selectionHandler(event: MouseEvent, file: Dirent): void {
    if (event.ctrlKey) {
      this.selected.push(file);
    } else {
      this.selected = [file];
    }
  }
  
  doubleClickHandler(event: MouseEvent, file: Dirent): void {
    this.selected = [];

    if (this.isFolder(file)) {
      if (this.currentDirectory == '/') {
        this.currentDirectory = '/'+file.name;
      } else {
        this.currentDirectory = `${this.currentDirectory}/${file.name}`;
      }
    }

    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  deleteFiles(): void {
    if (!confirm('Are you sure you want to delete these files?')) return;

    this.selected.forEach((file) => {
      this.fs.unlinkSync(this.currentDirectory+'/'+file.name);
    });

    this.selected = [];

    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  createFolder(): void {
    const folderName = prompt('Folder Name');

    this.fs.mkdirSync(this.currentDirectory+'/'+folderName);
    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  createFile(): void {
    const fileName = prompt('File Name');

    this.fs.writeFileSync(this.currentDirectory+'/'+fileName, '');
    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  renameFile(file: Dirent): void {
    const newName = prompt('New name', file.name.toString());
    if (newName == null) return;
    this.fs.renameSync(this.currentDirectory+'/'+file.name, this.currentDirectory+'/'+newName);
    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  isFolder(file: Dirent): boolean {
    return this.fs.lstatSync(this.currentDirectory+'/'+file.name).isDirectory() 
  }

  async dropHandler(event: DragEvent): Promise<void> {
    event.preventDefault();

    if (!event.dataTransfer) return;

    for (const file of event.dataTransfer.items) {
      await this.writeFileOrDirectory(file.webkitGetAsEntry(), this.currentDirectory);
    }

    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  async writeFileOrDirectory(file: FileSystemFileEntry | FileSystemDirectoryEntry, dir: string): Promise<void> {
    console.log(file);

    if (file.isDirectory) {
      this.fs.mkdirSync(dir+'/'+file.name);

      const directoryReader = (file as FileSystemDirectoryEntry).createReader();
      const entries = await this.readEntries(directoryReader);

      if (entries == null) return;

      for (const f of entries) {
        await this.writeFileOrDirectory(f, dir+'/'+file.name);
      }
    } else {
      this.fs.writeFileSync(dir+'/'+file.name, (await file.name).toString());
    }
  }

  async readEntries(directoryReader: FileSystemDirectoryReader): Promise<Array<FileSystemFileEntry | FileSystemDirectoryEntry> | null> {
    try {
      const entries = await new Promise((resolve) => {
        directoryReader.readEntries((entries: Array<FileSystemFileEntry | FileSystemDirectoryEntry>) => {
          resolve(entries);
        });
      });

      return entries as Array<FileSystemFileEntry | FileSystemDirectoryEntry>;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async mounted(): Promise<void> {
    await this.getVolumes();

    let id = this.$route.query.id;
    
    if (typeof id == 'string') {
      const vol = await this.getFullVolume(id);
      
      if (vol) {
        this.volume = vol;
        this.fs = FSVolume.fromJSON(this.volume.files);
        this.loaded = true;
        this.currentDirectoryListing = this.listDirectory() as Dirent[];
      }
    }
  }
}
</script>
