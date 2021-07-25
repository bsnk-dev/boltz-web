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
        <i class="bi-file-plus fs-6"></i>
        New File
      </button>
      <button class="btn btn-light me-2" @click="createFolder()">
        <i class="bi-folder-plus fs-6"></i>
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
      <button
        class="btn btn-success ms-auto"
        :disabled="!volumeModified"
        @click="saveVolume()"
      >
        <i class="bi-save fs-6"></i>
        Save Volume
      </button>
    </div>

    <div
      class="table-responsive mt-2"
      style="min-height: 80vh"
      @drop="dropHandler($event); dragBorder = false;"
      @dragover="dragBorder = true; $event.preventDefault();"
      @dragleave="dragBorder = false"
      :class="(dragBorder) ? 'border border-primary border-5 rounded' : 'border border-white border-5 rounded'"
    >
      <table
        class="
          table
          table-striped
          table-hover
          table-bordered-curved
          table-borderless
          table-sm
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

    <file-editor
      ref="modal"
      :file="openFile"
      v-if="editing"
      @save="saveOpenFile($event)"
      @cancel="editing = false"
    ></file-editor>
  </div>
</template>

<script lang="ts">
import { VolumeI } from "@/interfaces/instances";
import RefreshAppInfo from "@/mixins/refreshAppInfo.vue";
import {
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
  FileSystemDirectoryReader,
} from "@/interfaces/filesystem";
import { Component, Mixins, Vue } from "vue-property-decorator";
import { vol as Vol, Volume as FSVolume } from "memfs";
import authFetch from "@/utilities/authFetch";
import Dirent from "memfs/lib/Dirent";
import { TDataOut } from "memfs/lib/encoding";
import FileEditor from "@/components/FileEditor.vue";
import { Modal } from "bootstrap";

@Component({
  components: {
    FileEditor,
  },
})
export default class Volume extends Mixins(RefreshAppInfo) {
  loaded = false;
  volume!: VolumeI;

  fs!: typeof Vol;

  currentDirectory = "/";
  currentDirectoryListing: Dirent[] = [];

  selected: Dirent[] = [];

  openFile: { name: string; contents: string } = { name: "", contents: "" };
  editing = false;

  volumeModified = false;

  dragBorder = false;

  listDirectory(): TDataOut[] | Dirent[] {
    return this.fs.readdirSync(this.currentDirectory, { withFileTypes: true });
  }

  get currentDirectoryBreadcrumbs(): { name: string; path: string }[] {
    const paths = this.currentDirectory.split("/");

    paths[0] = "/";

    let pathsFull: { name: string; path: string }[] = [];

    for (let i = 0; i < paths.length; i++) {
      pathsFull.push({
        name: paths[i],
        path: paths
          .slice(0, i + 1)
          .join("/")
          .slice(1),
      });
    }

    pathsFull[0].name = "root";

    return pathsFull;
  }

  async getFullVolume(volumeID: string): Promise<VolumeI | null> {
    const res = await authFetch(
      `${this.$store.state.adminAPIURL}/admin/getVolume?id=${volumeID}`
    );

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
    if (this.isFolder(file)) {
      if (this.currentDirectory == "/") {
        this.currentDirectory = "/" + file.name;
      } else {
        this.currentDirectory = `${this.currentDirectory}/${file.name}`;
      }

      this.currentDirectoryListing = this.listDirectory() as Dirent[];
    } else {
      const fileContents = this.fs.readFileSync(
        `${this.currentDirectory}/${file.name}`
      );

      this.openFile = {
        name: file.name.toString(),
        contents: fileContents.toString(),
      };

      this.editing = true;

      this.$nextTick(() => {
        this.toggleModal(true);
      });
    }

    this.selected = [];
  }

  deleteFiles(): void {
    if (!confirm("Are you sure you want to delete these files?")) return;

    this.selected.forEach((file) => {
      if (this.isFolder(file)) {
        this.fs.rmdirSync(`${this.currentDirectory}/${file.name}`, {
          recursive: true,
        });
      } else {
        this.fs.unlinkSync(`${this.currentDirectory}/${file.name}`);
      }

      this.volumeModified = true;
    });

    this.selected = [];

    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  createFolder(): void {
    const folderName = prompt("Folder Name");

    if (!folderName) return;

    this.fs.mkdirSync(this.currentDirectory + "/" + folderName);
    this.currentDirectoryListing = this.listDirectory() as Dirent[];

    this.volumeModified = true;
  }

  createFile(): void {
    const fileName = prompt("File Name");

    if (!fileName) return;

    this.fs.writeFileSync(this.currentDirectory + "/" + fileName, "");
    this.currentDirectoryListing = this.listDirectory() as Dirent[];

    this.volumeModified = true;
  }

  renameFile(file: Dirent): void {
    const newName = prompt("New name", file.name.toString());
    if (newName == null) return;
    this.fs.renameSync(
      this.currentDirectory + "/" + file.name,
      this.currentDirectory + "/" + newName
    );
    this.currentDirectoryListing = this.listDirectory() as Dirent[];

    this.volumeModified = true;
  }

  isFolder(file: Dirent): boolean {
    return this.fs
      .lstatSync(this.currentDirectory + "/" + file.name)
      .isDirectory();
  }

  async dropHandler(event: DragEvent): Promise<void> {
    event.preventDefault();

    if (!event.dataTransfer) return;

    const items = event.dataTransfer.items;
    const totalItems = event.dataTransfer.items.length;

    for (const [index, file] of Object.entries(items)) {
      this.writeFileOrDirectory(
        file.webkitGetAsEntry(),
        this.currentDirectory
      ).then(() => {
        if (Number(index) == totalItems - 1) {
          this.currentDirectoryListing = this.listDirectory() as Dirent[];
        }
      });

      this.volumeModified = true;
    }

    this.currentDirectoryListing = this.listDirectory() as Dirent[];
  }

  async writeFileOrDirectory(
    file: FileSystemFileEntry | FileSystemDirectoryEntry,
    dir: string
  ): Promise<void> {
    if (file.isDirectory) {
      this.fs.mkdirSync(dir + "/" + file.name);

      const directoryReader = (file as FileSystemDirectoryEntry).createReader();
      const entries = await this.readEntries(directoryReader);

      if (entries == null) return;

      for (const f of entries) {
        await this.writeFileOrDirectory(f, dir + "/" + file.name);
      }
    } else {
      this.fs.writeFileSync(
        dir + "/" + file.name,
        (
          await (
            await this.getFileUploadContents(file as FileSystemFileEntry)
          ).text()
        ).toString()
      );
    }

    this.volumeModified = true;
  }

  async getFileUploadContents(file: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      file.file(resolve, reject);
    });
  }

  async readEntries(
    directoryReader: FileSystemDirectoryReader
  ): Promise<Array<FileSystemFileEntry | FileSystemDirectoryEntry> | null> {
    try {
      const entries = await new Promise((resolve) => {
        directoryReader.readEntries(
          (entries: Array<FileSystemFileEntry | FileSystemDirectoryEntry>) => {
            resolve(entries);
          }
        );
      });

      return entries as Array<FileSystemFileEntry | FileSystemDirectoryEntry>;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  toggleModal(on: boolean): void {
    if (!this.$refs.modal) return;
    const modal = new Modal((this.$refs.modal as Vue).$el as HTMLElement, {});

    on ? modal.show() : modal.hide();
  }

  async saveVolume(): Promise<void> {
    const res = await authFetch(
      `${this.$store.state.adminAPIURL}/admin/createOrUpdateVolume`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: this.volume._id,
          name: this.volume.name,
          files: JSON.stringify(this.fs.toJSON()),
        }),
      }
    );

    if (!res.ok) throw "Failed to save volume!";

    this.volumeModified = false;
  }

  saveOpenFile(newFile: { name: string; contents: string}): void {
    this.fs.writeFileSync(
      this.currentDirectory + "/" + newFile.name,
      newFile.contents
    );
    this.editing = false;
    this.volumeModified = true;
  }

  async mounted(): Promise<void> {
    await this.getVolumes();

    let id = this.$route.query.id;

    if (typeof id == "string") {
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

<style>
tr:not(.bg-primary) {
  border-radius: 8px;
}
</style>