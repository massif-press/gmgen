<template>
  <div>
    <DemoLayout
      title="BASIC DEMO"
      subtitle="RPG Weapon Generator with a single-level static JSON library"
    >
      <template #generator>
        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn @click="generate()">GENERATE WEAPON</Btn>
          </div>
          <div
            class="w-1/2 justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <string v-html="output.str" />
            <!-- Iron Shortsword (1d6 slashing) -->
          </div>
        </div>
      </template>

      <template #data>
        <div>
          <b>basic_example_data.json</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            <pre>{{ dataStr }}</pre>
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
import demo from './basic_demo';
import * as rawData from './basic_example_data.json';
import codeText from './basic_demo.ts?raw';

let output = reactive({
  str: '<i class="opacity-50">Click the "Generate Weapon" button</i>',
});

const dataStr = JSON.stringify((rawData as any).default, null, 2);

const codeStr = codeText;

const generate = () => {
  output.str = demo();
};
</script>
