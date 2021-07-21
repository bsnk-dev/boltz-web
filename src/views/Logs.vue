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
      <h1 class="h2">{{ instance.name }} Logs</h1>
      <article class="fs-6" style="opacity: 0.8">
        {{ instance._id }}
      </article>
    </div>

    <div class="d-flex align-items-center">
      <button class="btn btn-light me-2" @click="loadLogs(instance._id)">
        <i class="bi-arrow-clockwise fs-6"></i>
        Refresh
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover table-bordered-curved table-borderless" v-if="loaded">
        <thead>
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">Message</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log of logs" :key="log._id">
            <td>
              {{ log.severity }}
            </td>
            <td>
              {{ log.message }}
            </td>
            <td>
              {{ new Date(log.timestamp).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { InstanceI } from '@/interfaces/instances';
import RefreshAppInfo from '@/mixins/refreshAppInfo.vue';
import authFetch from '@/utilities/authFetch';
import {Component, Mixins} from 'vue-property-decorator';

type Severity = 'info' | 'warn' | 'error';
interface LogI {
  _id?: string;
  severity: Severity;
  message: string;
  timestamp: number;
}

@Component
export default class Logs extends Mixins(RefreshAppInfo) {
  logs: LogI[] = [];
  loaded = false;
  instance: InstanceI | null = null;

  async loadLogs(instanceID: string): Promise<void> {
    const logs = await authFetch(`${this.$store.state.adminAPIURL}/admin/getLogs?id=${instanceID}`);
    this.logs = (await logs.json()).sort((a: LogI, b: LogI) => a.timestamp - b.timestamp);
  }

  async mounted(): Promise<void> {
    await this.getInstances();

    const instance = this.instances.find((i: InstanceI) => i._id == this.$route.query.instanceID);
    this.instance = instance;

    await this.loadLogs(instance._id);

    this.loaded = true;
  }
}
</script>
