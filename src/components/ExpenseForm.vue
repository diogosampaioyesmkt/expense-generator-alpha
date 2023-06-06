<template>
  <form class="expense-form card" @submit.prevent="saveExpense">
    <header class="card-header">
      <p class="card-header-title">Registar Despesa</p>
    </header>

    <div class="card-content">
      <div class="content">

        <div class="field">
          <label class="label is-small">Tipo</label>
          <div class="control">
            <div class="select is-fullwidth is-small">
              <select class="is-fullwidth" v-model="expense.type" @select="changeDesc">
                <option v-for="(type, idx) in types" :key="idx" :value="idx">{{ type }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label is-small">Descrição</label>
          <div class="control">
            <input class="input is-small" type="text" v-model="expense.desc">
          </div>
        </div>

        <div class="field">
          <label class="label is-small">Data</label>
          <div class="control">
            <input class="input is-small" type="date" v-model="expense.date">
          </div>
        </div>

        <div class="field mb-4">
          <label class="label is-small">Valor</label>
          <div class="control">
            <input class="input is-small" type="number" v-model="expense.value">
          </div>
        </div>

        <button class="button is-primary is-small is-fullwidth" type="submit">Gravar</button>

      </div>
    </div>
  </form>
</template>

<style scoped>
/* Your styles here */
</style>

<script setup>
import { useDefaults } from "@/services/utils";

defineProps(['expense']);
const emits = defineEmits(['on-submit']);
const { types } = useDefaults();

const saveExpense = e => emits('on-submit', e);
</script>
