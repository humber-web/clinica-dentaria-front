<!-- src/components/PatientsFichaTab.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, useCookie } from '#imports'
import { useToast } from '@/components/ui/toast'


const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const token = useCookie('token')

// Estado interno em vez de props.isLoading
const loading = ref(true)
const template = ref<any[]>([])
const ficha = ref<any | null>(null)

// Carrega o template e a ficha clínica
async function loadFichaTab() {
  loading.value = true
  try {
    const pacienteId = route.params.id
    // Busca o template do questionário
    const tplRes = await fetch(`${apiBase}pacientes/template`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
    })
    if (!tplRes.ok) throw new Error('Não foi possível carregar o template')
    template.value = await tplRes.json()

    // Busca a ficha clínica (pode não existir ainda => 404)
    const fichaRes = await fetch(`${apiBase}pacientes/ficha/${pacienteId}`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
    })
    if (fichaRes.ok) {
      ficha.value = await fichaRes.json()
    } else if (fichaRes.status === 404) {
      ficha.value = null
    } else {
      throw new Error('Não foi possível carregar a ficha clínica')
    }
  } catch (err: any) {
    toast.toast({ title: 'Erro', description: err.message, variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

onMounted(loadFichaTab)

// Quando o usuário salva no <FichaForm>
function handleSave(novaFicha: any) {
  ficha.value = novaFicha
  toast.toast({ title: 'Sucesso', description: 'Ficha clínica salva.' })
}

// Quando o usuário cancela
function handleCancel() {
  toast.toast({ title: 'Operação cancelada' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Spinner enquanto carrega -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <!-- Quando terminar de carregar, renderiza o formulário -->
    <div v-else>
      <PatientsFicha
        v-if="template.length"
        :template="template"
        :id="ficha?.id"
        :ficha="ficha"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<style scoped>
/* ajustes específicos, se precisar */
</style>
