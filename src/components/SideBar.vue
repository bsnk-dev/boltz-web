<template>
  <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
    <div class="position-sticky pt-3">
      <ul class="nav flex-column">
        <li class="nav-item"
          v-for="item of items"
          :key="item.route"
        >
          <a 
            style="cursor: pointer;"
            :class="($route.name == item.route) ? 'nav-link active' : 'nav-link'"
            class="d-flex align-items-center" 
            @click="$router.push({name: item.route})">
            <i :class="item.icon" class="fs-6 me-2"></i>
            
            <span>{{ item.title }}</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class SideBar extends Vue {
  items = [
    {
      title: 'Dashboard',
      icon: 'bi-house-fill',
      route: 'Dashboard',
    },
    {
      title: 'Instances',
      icon: 'bi-stack',
      route: 'Instances',
    },
    {
      title: 'Volumes',
      icon: 'bi-hdd-stack',
      route: 'Volumes',
    },
    {
      title: 'About',
      icon: 'bi-info-circle',
      route: 'About',
    }
  ];

  pinnedInstances = [
    {
      name: 'Instance 1',
      icon: 'bi-server',
      path: '/instances/1',
    }
  ];

  pinnedVolumes = [
    {
      name: 'Volume 1',
      icon: 'bi-hdd',
      path: '/volumes/1',
    }
  ];
}
</script>
