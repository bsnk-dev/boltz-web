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
    >
      <h1 class="h2">Volumes</h1>
      <article class="fs-6">
        This is a list of all available volumes, you can delete, modify, and create more volumes from here.
        Double click a volume to edit its contents.
      </article>
    </div>

    <div class="d-flex align-items-center mt-5">
      <button class="btn btn-primary me-2" @click="createVolume()">
        <i class="bi-plus fs-6"></i>
        Create Volume
      </button>
      <button class="btn btn-light me-2" :disabled="selected.length > 1 || !selected.length" @click="renameVolume(selected[0])">
        <i class="bi-pencil-square fs-6"></i>
        Rename
      </button>
      <button class="btn btn-light text-danger" :disabled="!selected.length" @click="deleteVolumes(selected)">
        <i class="bi-trash fs-6"></i>
        Delete
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover table-bordered-curved table-borderless" v-if="loaded">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">ID</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="volume of volumes"
            :key="volume.name"
            :class="(selected.includes(volume)) ? 'bg-primary text-white' : ''"
            @click="selectionHandler($event, volume)"
            @dblclick="$router.push({ name: 'Volume', query: { id: volume._id}})"
          >
            <td>{{ volume.name }}</td>
            <td>{{ volume._id }}</td>
            <td>
              <a
                @click="$router.push({ name: 'Volume', query: { id: volume._id}})"
                class="link-primary"
              >
                Edit Files
                <i class="bi bi-chevron-right"></i>
              </a>
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
import authFetch from '@/utilities/authFetch';
import {Component, Mixins} from 'vue-property-decorator';

@Component
export default class Volumes extends Mixins(RefreshAppInfo) {
  selected: VolumeI[] = [];
  loaded = false;

  selectionHandler(event: MouseEvent, volume: VolumeI): void {
    if (event.ctrlKey) {
      this.selected.push(volume);
    } else {
      this.selected = [volume];
    }
  }

  async createVolume(): Promise<void> {
    const name = prompt('New volume name');

    if (name) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/createOrUpdateVolume`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          files: '{}'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    this.getVolumes();
  }

  async renameVolume(volume: VolumeI): Promise<void> {
    const name = prompt('New volume name', volume.name);
    if (name) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/createOrUpdateVolume`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          id: volume._id,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    this.getVolumes();
  }

  async deleteVolumes(selected: VolumeI[]): Promise<void> {
    if (!confirm('Are you sure you want to delete the selected volumes?')) return;

    for (const volume of selected) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/deleteVolume`, {
        method: 'POST',
        body: JSON.stringify({
          id: volume._id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    this.getVolumes();
  }

  async mounted(): Promise<void> {
    await this.getVolumes();
    this.loaded = true;
  }
}
</script>

<style scoped>
  a {
    cursor: pointer;
    text-decoration: none;
  }

  .text-white a {
    color: white;
  }

  a.disabled {
    pointer-events: none;
    opacity: 0.65;
  }
</style>

