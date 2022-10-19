<template>
  <div>
    <DemoLayout
      title="INTERACTIVE DEMO"
      subtitle="RPG treasure generator with modifiable templates and selections"
    >
      this one should have weighted selections
      <template #generator>
        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn>GENERATE WEAPON</Btn>
          </div>
          <div
            class="w-1/2 justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            Iron Shortsword (1d6 slashing)
          </div>
        </div>
      </template>

      <template #data>
        <div>
          <b>data.json</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            { data: [] }
          </div>
        </div>
      </template>
      <template #code>
        <div>
          <b>data.json</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            new code=ok
          </div>
        </div>
      </template>
    </DemoLayout>
  </div>
</template>

<script setup lang="ts">
import Btn from '../_components/btn.vue';
import DemoLayout from '../_components/demoLayout.vue';
</script>
