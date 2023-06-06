<template>
  <div>
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-brand">
            <router-link :to="{ name: 'home' }" class="navbar-item">Home</router-link>
          </div>
          <div class="navbar-link is-arrowless">
            <router-link :to="{ name: 'validate' }" class="navbar-link is-arrowless">Validação</router-link>
          </div>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <a class="button is-light" @click.prevent="logout">Logout</a>
          </div>
        </div>
      </div>
    </nav>
    <!-- Table for displaying estimations of all users -->
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Estimations</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.email">
          <td>{{ user.email }}</td>
          <td>{{ user.estimations }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Form for creating a new estimation -->
    <form @submit.prevent="addEstimation">
      <input type="text" v-model="newEstimation" placeholder="New Estimation" />
      <button type="submit">Add Estimation</button>
    </form>
  </div>
</template>
  
<script>
</script>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  border: 1px solid #ddd;
}

form {
  margin-top: 16px;
}
</style>
  