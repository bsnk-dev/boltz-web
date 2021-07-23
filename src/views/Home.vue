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

    <h3> {{ (serverLoad.total_heap_size / 1024 / 1024).toFixed(1) }} MB out of {{ (serverLoad.heap_size_limit / 1024 / 1024).toFixed(1) }} MB max</h3>

    <h4 class="mt-5 mb-2">Things to do</h4>

    <div class="d-flex flex-wrap">
      <div class="card me-2 mb-2" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Instances</h5>
          <p class="card-text">Create, modify, and explore your VM instances.</p>
          <a href="#" class="btn btn-primary">Go there</a>
        </div>
      </div>

      <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Volumes</h5>
          <p class="card-text">Create, modify, and explore your volumes, including file contents.</p>
          <a href="#" class="btn btn-primary">Go there</a>
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
  serverLoad: { total_heap_size: number; heap_size_limit: number; } = {
    total_heap_size: 0,
    heap_size_limit: 0,
  };

  async getServerLoad(): Promise<void> {
    this.serverLoad = await (await authFetch(`${this.$store.state.adminAPIURL}/admin/getServerLoad`)).json();
  }

  async mounted(): Promise<void> {
    this.getServerLoad();
  }
}
</script>
