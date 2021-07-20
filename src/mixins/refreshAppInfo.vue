<script lang="ts">
import authFetch from '@/utilities/authFetch';
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class RefreshAppInfo extends Vue {
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
}
</script>
