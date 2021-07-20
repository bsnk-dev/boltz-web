<template>
  <div v-click-outside="() => selected = []">
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
      <h1 class="h2">Instances</h1>
      <article class="fs-6">
        This is a list of all instances, you can delete, modify, or add new instances to run code
        found in volumes.
      </article>
    </div>

    <h4 class="mt-5">Manage</h4>

    <div class="d-flex align-items-center">
      <button class="btn btn-primary me-2" @click="createInstance()">
        <i class="bi-plus fs-6"></i>
        New Instance
      </button>
      <button class="btn btn-light me-2" @click="toggleModal(true)" :disabled="!selected.length">
        <i class="bi-hdd fs-6"></i>
        Mount Volume
      </button>
      <button class="btn btn-light me-2" :disabled="selected.length > 1 || !selected.length" @click="renameInstance(selected[0])">
        <i class="bi-pencil-square fs-6"></i>
        Rename
      </button>
      <button class="btn btn-light text-danger" :disabled="!selected.length" @click="deleteInstances(selected)">
        <i class="bi-trash fs-6"></i>
        Delete
      </button>
    </div>

    <div class="modal fade" id="staticBackdrop" ref="modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Select a Volume</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <select 
              class="form-select" 
              size="5" 
              v-model="modalSelectedVolume"
            >
              <option
                v-for="volume of volumes"
                :key="volume._id"
                :value="volume._id"
              >
                {{ volume.name }} ({{ volume._id }})
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="mountVolumes(modalSelectedVolume);" data-bs-dismiss="modal">Mount</button>
          </div>
        </div>
      </div>
    </div>


    <div class="table-responsive">
      <table class="table table-striped table-hover table-bordered-curved table-borderless" v-if="loaded">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Mounted Volume</th>
            <th scope="col">Logs</th>
            <th scope="col">ID</th>
            <th scope="col">Endpoint</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="instance of instances"
            :key="instance.name"
            :class="(selected.includes(instance)) ? 'bg-primary text-white' : ''"
            @click="selectionHandler($event, instance)"
          >
            <td>{{ instance.name }}</td>
            <td>
              <a
                class="link-primary"
                :class="(getVolume(instance.volumeID).invalid) ? 'disabled' : ''"
                @click="$router.push({ name: 'Volume', query: { id: instance.volumeID }})"
              >
                {{ getVolume(instance.volumeID).name }}
              </a>
            </td>
            <td>
              <a
                @click="$router.push({ name: 'Logs', query: { instanceID: instance._id }})"
                class="link-primary"
              >
                Logs
              </a>
            </td>
            <td>
              {{ instance._id }}
            </td>
            <td>
              <a
                class="link-primary"
                :href="`${$store.state.executionAPIURL}/${instance._id}/`"
                target="_blank"
              >
                Endpoint
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator';
import {InstanceI, VolumeI} from '@/interfaces/instances';
import refreshAppInfo from '@/mixins/refreshAppInfo.vue';
import Modal from 'bootstrap/js/dist/modal';

// eslint-disable-next-line
// @ts-ignore
import ClickOutside from 'vue-click-outside'
import authFetch from '@/utilities/authFetch';

@Component({
  directives: {
    ClickOutside,
  }
})
export default class Instances extends Mixins(refreshAppInfo) {
  get instances(): InstanceI  {
    return this.$store.getters.instances;
  }

  selected: InstanceI[] = [];
  loaded = false;

  modalSelectedVolume = '';


  // adds an instance to the selected array if the user is holding shift, otherwise it
  // replaces the array with the instance
  selectionHandler(event: MouseEvent, instance: InstanceI): void {
    if (event.ctrlKey) {
      this.selected.push(instance);
    } else {
      this.selected = [instance];
    }
  }

  async mountVolumes(newVolumeID: string): Promise<void> {
    for (const instance of this.selected) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/updateInstance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: instance._id,
          instance: {
            volumeID: newVolumeID,
          },
        }),
      });
    }

    await this.getInstances();
  }

  async renameInstance(instance: InstanceI): Promise<void> {
    const newName = await prompt('New instance name', instance.name);

    if (newName) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/updateInstance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: instance._id,
          instance: {
            name: newName,
          },
        }),
      });
    }

    await this.getInstances();
  }

  async deleteInstances(instances: InstanceI[]): Promise<void> {
    const confirmed = await confirm(`Are you sure you want to delete ALL SELECTED INSTANCES?`);

    if (!confirmed) return;

    for (const instance of instances) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/deleteInstance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: instance._id,
        }),
      });
    }

    await this.getInstances();
  }

  async createInstance(): Promise<void> {
    const newName = await prompt('New instance name');
    
    if (newName) {
      await authFetch(`${this.$store.state.adminAPIURL}/admin/createInstance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
        }),
      });
    }

    this.getInstances();
  }

  toggleModal(on: boolean): void {
    if (!this.$refs.modal) return;
    const modal = new Modal(this.$refs.modal as HTMLElement, {});

    (on) ? modal.show() : modal.hide();
  }

  async mounted(): Promise<void> {
    await this.getVolumes();
    await this.getInstances();

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