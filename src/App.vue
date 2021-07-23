<template>
  <div id="app">
    <template v-if="isSignedIn">
      <header class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" @click="$router.push({name: 'Dashboard'})">Boltz</a>
        <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="form-control bg-dark w-100"/>
        <div class="navbar-nav">
          <div class="nav-item text-nowrap">
            <a class="nav-link px-3" @click="signOut()">Sign out</a>
          </div>
        </div>
      </header>

      <div class="container-fluid">
        <div class="row">
          <side-bar/>

          <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <router-view/>
          </main>
        </div>
      </div>
    </template>

    <div v-else style="width: 100vw; height: 100vh">
      <SignIn/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import SideBar from '@/components/SideBar.vue';
import SignIn from '@/views/SignIn.vue';

@Component({
  components: {
    SideBar,
    SignIn
  },
})
export default class App extends Vue {
  get isSignedIn (): boolean {
    return this.$store.getters.isSignedIn;
  }

  signOut(): void {
    this.$store.dispatch('signOut');
  }
}
</script>


<style>
  @import'~bootstrap/dist/css/bootstrap.css';
  @import'~bootstrap-icons/font/bootstrap-icons.css';
</style>