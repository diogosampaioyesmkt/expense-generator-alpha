<template>
  <div class="login">

    <div class="card">
      <div class="card-content">
        <div class="content">
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input class="input" type="text" v-model="signInForm.email" placeholder="email">
            </div>
          </div>
          <div class="field">
            <label class="label">Password</label>
            <div class="control">
              <input class="input" type="password" v-model="signInForm.pass" placeholder="password">
            </div>
          </div>
        </div>
      </div>
      <footer class="card-footer">
        <!--<a href="#" class="card-footer-item is-link" @click.prevent="logout">Sair</a>-->
        <a href="#" class="card-footer-item is-link is-primary is-light" @click.prevent="signIn">Entrar</a>
      </footer>
    </div>

  </div>
</template>

<style scoped>
.login {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  width: 100%;
  height: 100vh;
}
</style>

<script setup>
  import { useAuth } from "@/services/auth";
  import { reactive } from "vue";
  import router from "@/router";

  const { login, logout } = useAuth();
  const signInForm = reactive({email: '', pass: ''});

  const signIn = () => {
    if (signInForm.email && signInForm.pass) {
      login(signInForm.email, signInForm.pass).then(u => {
        router.push('home');
      })
    }
  }
</script>
