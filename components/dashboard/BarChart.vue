<template>
    <h1>te</h1>
  <!-- <Card class="p-6">
    <CardHeader class="flex flex-row items-center justify-between p-0 mb-4">
      <CardTitle>{{ title }}</CardTitle>
      <div class="flex gap-2">
        <slot name="actions" />
      </div>
    </CardHeader>
    
    <CardContent class="p-0">
      <canvas 
        ref="chartCanvas" 
        class="w-full h-64"
        :width="400" 
        :height="200"
      ></canvas>
    </CardContent>
  </Card> -->
</template>

<script setup lang="ts">
// import { ref, onMounted, watch, nextTick } from 'vue';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Chart, registerables } from 'chart.js';

// // Registrar componentes do Chart.js
// Chart.register(...registerables);

// // Props do componente
// interface Props {
//   data: Array<{ label: string; value: number }>;
//   title: string;
// }

// const props = defineProps<Props>();

// // Referência para o canvas
// const chartCanvas = ref<HTMLCanvasElement | null>(null);
// let chartInstance: Chart | null = null;

// // Configuração do gráfico
// const createChart = async () => {
//   await nextTick();
  
//   if (!chartCanvas.value) return;
  
//   // Destruir gráfico anterior se existir
//   if (chartInstance) {
//     chartInstance.destroy();
//   }
  
//   // Preparar dados para Chart.js
//   const labels = props.data.map(item => item.label);
//   const values = props.data.map(item => item.value);
  
//   // Criar novo gráfico
//   chartInstance = new Chart(chartCanvas.value, {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [{
//         label: 'Quantidade',
//         data: values,
//         backgroundColor: [
//           'rgba(59, 130, 246, 0.8)',
//           'rgba(16, 185, 129, 0.8)',
//           'rgba(245, 158, 11, 0.8)',
//           'rgba(239, 68, 68, 0.8)',
//           'rgba(139, 92, 246, 0.8)'
//         ],
//         borderColor: [
//           'rgb(59, 130, 246)',
//           'rgb(16, 185, 129)',
//           'rgb(245, 158, 11)',
//           'rgb(239, 68, 68)',
//           'rgb(139, 92, 246)'
//         ],
//         borderWidth: 1
//       }]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         y: {
//           beginAtZero: true
//         }
//       },
//       plugins: {
//         legend: {
//           display: false
//         }
//       }
//     }
//   });
// };

// // Observar mudanças nos dados
// watch(() => props.data, createChart, { deep: true });

// // Criar gráfico quando componente for montado
// onMounted(createChart);
</script>