<template>
  <div>
    <div
      class="
        d-flex
        justify-content-between
        flex-wrap flex-md-nowrap
        align-items-center
        pt-3
        pb-2
        mb-3
        border-bottom
      "
    >
      <h1 class="h2">Dashboard</h1>
    </div>

    <div class="d-flex align-items-center">
      <h4>Server Load</h4>
      <button class="btn btn-light ms-2 btn-sm" @click="getServerLoad()">
        <i class="bi bi-refresh"></i>
        Refresh
      </button>
    </div>

    <h3> {{ (serverLoad.totalMemoryUsage / 1024 / 1024).toFixed(1) }} MB Memory of {{ (serverLoad.totalMemory / 1024 / 1024).toFixed(1) }} MB Memory</h3>
    <h3> {{ (serverLoad.totalCPUUsage / 100).toFixed(2) }} vCores of {{ (serverLoad.totalCores) }} vCores</h3>
    <h3> {{ (serverLoad.vmPackagesSize / 1024 / 1024).toFixed(1) }} MB Storage</h3>

    <h4 class="mt-5 mb-2">Things to do</h4>

    <div class="d-flex flex-wrap">
      <div class="card me-2 mb-2" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Instances</h5>
          <p class="card-text">Create, modify, and explore your VM instances.</p>
          <a class="btn btn-primary" @click="$router.push({ name: 'Instances' })">Go there</a>
        </div>
      </div>

      <div class="card me-2 mb-2" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Volumes</h5>
          <p class="card-text">Create, modify, and explore your volumes, including file contents.</p>
          <a class="btn btn-primary" @click="$router.push({ name: 'Volumes' })">Go there</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import authFetch from '@/utilities/authFetch';
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class Dashboard extends Vue {
  serverLoad = {
    totalMemoryUsage: 0,
    totalMemory: 0,
    totalCPUUsage: 0,
    totalCores: 0,
    vmPackagesSize: 0,
  };

  async getServerLoad(): Promise<void> {
    this.serverLoad = await (await authFetch(`${this.$store.state.adminAPIURL}/admin/getServerLoad`)).json();
  }

  async mounted(): Promise<void> {
    this.getServerLoad();
  }
}
</script>
