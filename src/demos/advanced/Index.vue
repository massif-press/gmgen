<template>
  <div>
    <DemoLayout
      title="ADVANCED DEMO"
      subtitle="Kobold Character Generator with a complex static JSON library"
    >
      <template #generator>
        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn @click="generate()">GENERATE KOBOLD</Btn>
          </div>
          <div
            class="w-1/2 justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <string v-html="output.str" />
          </div>
        </div>
      </template>

      <template #data>
        <div v-for="(d, i) in dataItems" :key="i">
          <div>
            <b>{{ d.filename }}</b>
            <div
              class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
            >
              <pre>{{ d.code }}</pre>
            </div>
          </div>
        </div>
      </template>
      <template #code>
        <div>
          <b>basic_demo.ts</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            <pre>{{ codeStr }}</pre>
          </div>
        </div>
      </template>
    </DemoLayout>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Btn from '../_components/btn.vue';
import DemoLayout from '../_components/demoLayout.vue';
import demo from './advanced_demo';
import * as rawData from './data';
import codeText from './advanced_demo.ts?raw';

let output = reactive({
  str: '<i class="opacity-50">Click the "Generate Weapon" button</i>',
});

const dataItems = Object.keys(rawData).map((d) => ({
  filename: `${d}.json`,
  code: JSON.stringify(rawData[d], null, 2),
}));

const codeStr = codeText;

const generate = () => {
  output.str = demo();
};
</script>
