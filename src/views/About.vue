<template>
  <div>
    <h1 class="mt-4">About</h1>

    <div class="card text-center mt-4 ms-auto me-auto" style="max-width: 700px">
      <div class="card-header">
        About this program
      </div>
      <div class="card-body">
        <img src="@/assets/logo.png" height="48px" width="48px"/>
        <h5 class="card-title">Boltz Engine</h5>
        <p class="card-text">Free and open source. By bsnk-dev.</p>
        <div>
          <a class="btn btn-dark" href="https://github.com/bsnk-dev/boltz-engine" target="_blank">
            <i class="bi bi-github"></i>
            <span class="d-none ms-2 d-lg-inline-block">Engine</span>
          </a>
          <a class="btn btn-dark ms-2" href="https://github.com/bsnk-dev/boltz-web" target="_blank">
            <i class="bi bi-github"></i>
            <span class="d-none ms-2 d-lg-inline-block">Interface</span>
          </a>
        </div>
      </div>
      <div class="card-footer text-muted">
        &copy; Copyright {{ new Date().getFullYear() }} bsnk-dev
      </div>
    </div>

  </div>
</template>
