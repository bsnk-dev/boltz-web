<template>
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-fullscreen-xl-down modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel"> {{ inMemory.name }} </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="cancel()"></button>
        </div>
        <div class="modal-body">
           <prism-editor class="editor" v-model="inMemory.contents" :highlight="highlighter" line-numbers></prism-editor>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal" @click="cancel()">Close</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="save()">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch} from 'vue-property-decorator';
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
// eslint-disable-next-line
// @ts-ignore
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

@Component({
  components: {
    PrismEditor,
  }
})
export default class FileEditor extends Vue {
  @Prop(Object) file!: { name: '', contents: '' };
  inMemory = {};

  @Watch('file')
  onFileChange(file: { name: string, contents: string }): void {
    this.inMemory = {
      name: file.name,
      contents: file.contents,
    };
  }

  highlighter(code: string): string {
    return highlight(code, languages.js);
  }

  save(): void {
    this.$emit('save', this.inMemory);
  }

  cancel(): void {
    this.$emit('cancel');
  }

  mounted(): void {
    this.inMemory = {
      name: this.file.name,
      contents: this.file.contents,
    }
  }
}
</script>

<style>
  .editor {
    background: #2d2d2d;
    color: #ccc;
    min-height: 500px;

    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
  }
</style>
