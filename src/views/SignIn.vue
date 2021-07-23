<template>
  <div class="signin-container">
     <main class="form-signin">
        <div>
          <img class="mb-4" src="@/assets/logo.png" height="72">
          <h1 class="h3 mb-3 fw-normal">Sign in to Manage Boltz</h1>

          <div class="form-floating">
            <input type="email" class="form-control" v-model="username" id="floatingInput" placeholder="name@example.com">
            <label for="floatingInput">Username</label>
          </div>
          <div class="form-floating">
            <input type="password" class="form-control" v-model="password" id="floatingPassword" placeholder="Password">
            <label for="floatingPassword">Password</label>
          </div>

          <button class="w-100 btn btn-lg btn-primary mt-5" @click="testSignIn()">Sign in</button>
          <p class="mt-5 mb-3 text-muted">&copy; bsnk-dev 2021</p>
        </div>
      </main>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import authFetch from '@/utilities/authFetch';

@Component
export default class SignIn extends Vue {
  username = '';
  password = '';

  createAuthString(username: string, password: string): string {
    return `Basic ${btoa(`${username}:${password}`)}`;
  }

  async testSignIn(): Promise<void> {
    this.$store.commit('setBasicAuthString', this.createAuthString(this.username, this.password));
    const test = await authFetch(`${this.$store.state.adminAPIURL}/admin/listInstances`);
    if (test.status === 200) {
      this.$store.commit('signedIn', true);
      this.$router.push({name: 'Dashboard'});
    }
  }
}
</script>


<style>
  .signin-container {
    width: 100vw;
    height: 100%;
    display: flex;
    align-items: center;
    padding-top: 40px;
    padding-bottom: 40px;
    background-color: #f5f5f5;
  }

  .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: auto;
    text-align: center;
  }

  .form-signin .checkbox {
    font-weight: 400;
  }

  .form-signin .form-floating:focus-within {
    z-index: 2;
  }

  .form-signin input[type="email"] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
</style>