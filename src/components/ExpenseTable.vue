<template>
  <div class="table-container">
    <table class="table is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr class="sticky-headers">
          <th>
            <div class="button-container">
              <button class="button is-small" @click="selectAllLines">Select All</button>
              <button v-if="Array.isArray(data.selectedLine) && data.selectedLine.length > 0" class="button is-small"
                @click="unselectAllLines">Unselect</button>
              <button class="button is-small is-danger" @click="removeSelectedLines"
                v-if="Array.isArray(data.selectedLine) && data.selectedLine.length > 0">Remove Selected</button>
            </div>
          </th>
          <th>
            <button class="button is-small" @click="sortBy('date')">Data</button>
          </th>
          <th>
            <button class="button is-small" @click="sortBy('type')">Tipo</button>
          </th>
          <th>
            <button class="button is-small" @click="sortBy('value')">Valor</button>
          </th>
          <th>Descrição</th>
          <th></th>
        </tr>
      </thead>

      <tbody class="scrollable-body">
        <tr v-for="(line, idx) in sortedLines" :key="idx" @click="selectLine(idx, line)"
          :class="{ 'is-selected': Array.isArray(data.selectedLine) && data.selectedLine.includes(idx) }">
          <td></td>
          <td>{{ line.date }}</td>
          <td>{{ line.type }}</td>
          <td>{{ line.value }}</td>
          <td>{{ line.desc }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <pre>Total: {{ totalExpenses }}€</pre>
</template>

<script setup>
import { onSnapshot } from 'firebase/firestore';
import { onMounted, reactive, watch } from "vue";
import { useFirestore } from "@/services/firestore";
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { computed } from "vue";

const emits = defineEmits(['selected-line']);
const props = defineProps(['month', 'user']);
const { list, update, remove, fs } = useFirestore();
const expenses = reactive({ lines: [] });
const data = reactive({ selectedLine: -1, sortBy: null, sortOrder: 'asc' });

const selectLine = (idx, line) => {
  if (Array.isArray(data.selectedLine)) {
    const selectedIndex = data.selectedLine.indexOf(idx);

    if (selectedIndex > -1) {
      data.selectedLine.splice(selectedIndex, 1);
    } else {
      data.selectedLine.push(idx);
    }
  } else {
    data.selectedLine = [idx];
  }

  const selectedLines = data.selectedLine.map((idx) => sortedLines.value[idx]);
  emits('selected-line', selectedLines);
};

const unselectAllLines = () => {
  data.selectedLine = [];
  emits('selected-line', []); 
};

const selectAllLines = () => {
  const selectedIndices = [];

  for (let i = 0; i < expenses.lines.length; i++) {
    selectedIndices.push(i);
  }

  data.selectedLine = selectedIndices;

  const selectedLines = selectedIndices.map((idx) => expenses.lines[idx]);
  emits('selected-line', selectedLines);
};

const removeSelectedLines = async () => {
  if (window.confirm('Remover despesas?')) {
    try {
      const selectedLineIds = data.selectedLine.map((idx) => expenses.lines[idx].id);
      const updatedExpenses = expenses.lines.filter((expense) => !selectedLineIds.includes(expense.id));
      
      const collectionPath = 'testediogo/yes/testediogo';
      const documentPath = expenses.firebaseId;
      await update(collectionPath, documentPath, { expenses: updatedExpenses });

      console.log('Expense deleted');
      loadExpenses();

      data.selectedLine = [];
      emits('selected-line', []); 
    } catch (err) {
      console.error('Error removing expenses', err);
    }
  }
};


const loadExpenses = () => {
  list('testediogo/yes/testediogo', { where: [['email', '==', props.user.email]] })
    .then((snapshot) => {
      const user = snapshot[0];
      expenses.firebaseId = user.id;
      
      const selectedMonth = new Date(props.month);
      const startOfMonthDate = startOfMonth(selectedMonth);
      const endOfMonthDate = endOfMonth(selectedMonth);

      const lines = user.expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate >= startOfMonthDate &&
          expenseDate <= endOfMonthDate
        );
      });
      
      expenses.lines = lines;
    })
    .catch((err) => {
      console.error('Error loading expenses:', err);
    });
};



onMounted(() => {
  loadExpenses();
});

watch(() => props.month, () => loadExpenses());

const totalExpenses = computed(() => {
  if (Array.isArray(data.selectedLine) && data.selectedLine.length > 0) {
    return data.selectedLine.reduce((total, idx) => {
      const line = expenses.lines[idx];
      return total + parseFloat(line.value);
    }, 0);
  } else {
    return 0;
  }
});



const sortBy = (property) => {
  if (data.sortBy === property) {
    data.sortOrder = data.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    data.sortBy = property;
    data.sortOrder = 'asc';
  }
};

const sortedLines = computed(() => {
  let lines = expenses.lines;

  if (data.sortBy) {
    lines = lines.slice().sort((a, b) => {
      const aValue = a[data.sortBy];
      const bValue = b[data.sortBy];

      if (data.sortBy === 'type') {
        if (data.sortOrder === 'asc') {
          if (!isNaN(aValue) && !isNaN(bValue)) {
            return aValue - bValue;
          } else if (!isNaN(aValue)) {
            return -1;
          } else if (!isNaN(bValue)) {
            return 1;
          } else {
            return aValue.toString().localeCompare(bValue.toString());
          }
        } else {
          if (!isNaN(aValue) && !isNaN(bValue)) {
            return bValue - aValue;
          } else if (!isNaN(aValue)) {
            return 1;
          } else if (!isNaN(bValue)) {
            return -1;
          } else {
            return bValue.toString().localeCompare(aValue.toString());
          }
        }
      } else if (data.sortBy === 'value') {
        const parsedA = parseFloat(aValue);
        const parsedB = parseFloat(bValue);

        if (!isNaN(parsedA) && !isNaN(parsedB)) {
          if (data.sortOrder === 'asc') {
            return parsedA - parsedB;
          } else {
            return parsedB - parsedA;
          }
        } else {
          return 0;
        }
      } else {
        if (data.sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });
  }

  return lines;
});


</script>

<style>
.button-container {
  display: flex;
  gap: 5px;
  width: 150px;
}

pre {
  font-weight: bold;
  font-size: 18px;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
}

.scrollable-body {
  overflow-y: auto;
}

.sticky-headers th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}

</style>
