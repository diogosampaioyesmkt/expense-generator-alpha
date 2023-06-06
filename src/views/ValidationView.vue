<template>
  <div class="validation-view">
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-brand">
            <router-link :to="{ name: 'home' }" class="navbar-link is-arrowless">Home</router-link>
          </div>
          <div class="navbar-link is-arrowless">
            <router-link :to="{ name: 'estimates' }" class="navbar-link is-arrowless">Estimativas</router-link>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item is-arrowless">
            <div class="buttons">
              <a class="button is-light" @click.prevent="logout">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <div class="columns">
        <div class="column">
          <div class="select is-fullwidth">
            <select v-model="selectedEmail" @change="fetchSelectedEmailExpenses">
              <option v-for="email in emails" :key="email" :value="email">{{ email }}</option>
            </select>
          </div>
        </div>
        <div class="column is-three-quarters">
          <div v-if="selectedEmail">
            <h3>{{ selectedEmail }}</h3>
            <ExpenseTable :expenses="getSelectedEmailExpenses" :editable="true"></ExpenseTable>
            <div class="buttons mt-4">
              <button class="button is-primary" @click="approveTable(selectedEmail)">Approve</button>
              <button class="button is-danger" @click="refuseTable(selectedEmail)">Refuse</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useFirestore } from "@/services/firestore";
import { useDefaults } from "@/services/utils";
import { format } from "date-fns";
import { startOfMonth, endOfMonth } from "date-fns";

export default {
  setup() {
    const firestore = useFirestore();
    const emails = ref([]);
    const selectedEmail = ref(null);
    const selectedEmailExpenses = ref([]);
    const { formatDate } = useDefaults();

    const fetchEmails = async () => {
      // Fetch all the emails from the Firestore database
      const snapshot = await firestore.getSubmittedTables();
      emails.value = snapshot.map((doc) => doc.userEmail);
    };

    const fetchSelectedEmailExpenses = async () => {
      // Fetch the consolidated table (expenses) for the selected email
      if (selectedEmail.value) {
        const snapshot = await firestore.getSubmittedTableByUserEmail(selectedEmail.value);
        selectedEmailExpenses.value = snapshot ? snapshot.expenses : [];
      } else {
        selectedEmailExpenses.value = [];
      }
    };

    const approveTable = async (email) => {
      // Update the approved property of the consolidated table to true
      await firestore.updateSubmittedTableByEmail(email, { approved: true });
      fetchSelectedEmailExpenses();
    };

    const refuseTable = async (email) => {
      // Update the approved property of the consolidated table to false
      await firestore.updateSubmittedTableByEmail(email, { approved: false });
      fetchSelectedEmailExpenses();
    };

    fetchEmails();

    return {
      emails,
      selectedEmail,
      getSelectedEmailExpenses: computed(() => selectedEmailExpenses.value),
      fetchSelectedEmailExpenses,
      approveTable,
      refuseTable,
      formatDate
    };
  }
};
</script>

<style scoped>
/* Styles omitted for brevity */
</style>