<script setup lang="ts">
import { useRoute } from 'vue-router';

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const route = useRoute();
const clinicId = route.params.id;

const loading = ref(true);
const clinic = ref<any>(null);
const clinicConfigs = ref([]);

const token = useCookie('token').value;

async function fetchClinicAndConfigs() {
  loading.value = true;
  // Busque os dados da clínica
  const clinicRes = await fetch(`${baseUrl}clinica/${clinicId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  clinic.value = await clinicRes.json();

  // Busque as configurações da clínica
  const configsRes = await fetch(`${baseUrl}clinica/configuracoes/${clinicId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  clinicConfigs.value = await configsRes.json();

  loading.value = false;
}

onMounted(fetchClinicAndConfigs);
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold tracking-tight">
          Configurações da Clínica
          <span v-if="clinic" class="ml-4 text-lg font-normal text-muted-foreground">
            {{ clinic.nome }}
          </span>
        </h1>
      </div>
    </div>

    <Card class="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>Definições Individuais</CardTitle>
        <CardDescription>
          Personalize as configurações desta clínica.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="py-8 text-center text-muted-foreground">Carregando...</div>
        <div v-else>
          <div v-if="clinicConfigs.length === 0" class="text-center text-muted-foreground py-8">
            Nenhuma configuração encontrada para esta clínica.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left">Chave</th>
                  <th class="px-4 py-2 text-left">Valor</th>
                  <th class="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="config in clinicConfigs" :key="config.id">
                  <td class="px-4 py-2">{{ config.chave }}</td>
                  <td class="px-4 py-2">
                    <Input v-model="config.valor" />
                  </td>
                  <td class="px-4 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end mt-4">
            <Button variant="default">
              Guardar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>