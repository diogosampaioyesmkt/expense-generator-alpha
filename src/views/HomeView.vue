<template>
  <div class="home-view">
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-brand">
            <router-link :to="{ name: 'home' }" class="navbar-link is-arrowless">Home</router-link>
          </div>
          <div class="navbar-item is-arrowless">
            <label>Mês Referência:</label>
          </div>
          <div class="navbar-item is-arrowless">
            <div class="select">
              <select v-model="data.month">
                <option v-for="(m, i) in data.months" :key="i" :value="m">{{ formatDate(m) }}</option>
              </select>
            </div>
          </div>
          <div class="navbar-link is-arrowless">
            <router-link :to="{ name: 'validate' }" class="navbar-link is-arrowless">Validação</router-link>
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
          <ExpenseForm :expense="data.expense" @on-submit="saveExpense"></ExpenseForm>
        </div>
        <div class="column is-three-quarters">
          <ExpenseTable :month="data.month" :user="loggedUser" @selected-line="selectLine"></ExpenseTable>
          <button class="button is-primary mt-4" @click="sendToValidation">Enviar para validação</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex-grow: 1;
  padding: 1rem;
  overflow: auto;
}

.navbar-link {
  color: white;
  cursor: pointer;
  text-decoration: none;
}
</style>

<script setup>
import { useAuth } from "@/services/auth";
import { onMounted, reactive, ref, watch } from "vue";
import { useDefaults } from "@/services/utils";
import { useFirestore } from "@/services/firestore";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseTable from "@/components/ExpenseTable";
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import sub from "date-fns/sub";

const { loggedUser, logout } = useAuth();
const { create, submitExpensesForValidation } = useFirestore();
const { typesDesc } = useDefaults();
const data = reactive({
  month: "2022-11-01",
  months: [],
  expense: { date: format(new Date(), "yyyy-MM-dd") }
});

const saveExpense = async () => {
  const user = { ...loggedUser.value };
  const expense = {
    date: data.expense.date,
    type: data.expense.type,
    desc: data.expense.desc,
    value: data.expense.value
  };

  const consolidatedTable = {
    email: user.email,
    expenses: [expense],
    approved: false,
    submitted: false
  };

  await create("testediogo/yes/testediogo", consolidatedTable);

  // Reset the expense fields
  data.expense.date = format(new Date(), "yyyy-MM-dd");
  data.expense.type = "";
  data.expense.desc = "";
  data.expense.value = "";
};


const formatDate = m => format(new Date(m), "MM/yyyy");

const selectLine = selectedLines => {
  if (selectedLines.length === 1) {
    // Update the data.expense object with the selected line data
    data.expense = { ...selectedLines[0] };
  } else {
    // Clear the data.expense object if multiple lines are selected
    data.expense = { date: format(new Date(), "yyyy-MM-dd") };
  }
};

const sendToValidation = async () => {
  // Assuming that "testediogo/yes/testediogo" is the collection path and loggedUser.email is the email of the user
  await submitExpensesForValidation("testediogo/yes/testediogo", loggedUser.email);
};


onMounted(() => {
  const now = startOfMonth(new Date());
  data.months.push(format(now, "yyyy-MM-dd"));
  for (let i = 1; i < 5; i++) {
    data.months.push(format(sub(now, { months: i }), "yyyy-MM-dd"));
  }
});

watch(() => data.expense.type, type => (data.expense.desc = typesDesc[type]));
</script>
