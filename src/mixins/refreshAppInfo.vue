<script lang="ts">
import { VolumeI } from '@/interfaces/instances';
import authFetch from '@/utilities/authFetch';
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class RefreshAppInfo extends Vue {
  get volumes(): VolumeI[] {
    return this.$store.getters.volumes;
  }

  async getInstances(): Promise<void> {
    const res = await authFetch(`${this.$store.state.adminAPIURL}/admin/listInstances`);
    const json = await res.json();

    this.$store.commit('setInstances', json);
  }

  // get volumes
  async getVolumes(): Promise<void> {
    const res = await authFetch(`${this.$store.state.adminAPIURL}/admin/listVolumes`);
    const json = await res.json();

    this.$store.commit('setVolumes', json);
  }

  getVolume(id: string): VolumeI | {name: string, invalid: true} {
    return this.volumes.find(volume => volume._id === id) || { name: 'Unknown Volume', invalid: true};
  }
}
</script>
