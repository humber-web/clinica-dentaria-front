<script setup lang="ts">
import { defineProps } from 'vue'
import { Phone, Mail, Calendar, Building2, MapPin, User, Plus } from 'lucide-vue-next'

type ProximaConsulta = {
  data: string
  hora: string
  doutor: string
}

type PacienteResumo = {
  telefone?: string
  email?: string
  dataNascimento: string
  clinica?: string
  endereco?: string
  totalConsultas?: number
  planosAtivos?: number
  proximaConsulta?: ProximaConsulta
}

const props = defineProps<{
  isLoading: boolean
  paciente: PacienteResumo | null
}>()

function formatarData(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton class="h-64 rounded-2xl" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Dados Pessoais</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-start">
              <Phone class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Telefone</p>
                <p class="text-sm text-muted-foreground">{{ paciente?.telefone || 'Não definido' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Email</p>
                <p class="text-sm text-muted-foreground">{{ paciente?.email || 'Não definido' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Data de Nascimento</p>
                <p class="text-sm text-muted-foreground">{{ formatarData(paciente!.dataNascimento) }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Building2 class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Clínica</p>
                <p class="text-sm text-muted-foreground">{{ paciente?.clinica || 'Principal' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <MapPin class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Endereço</p>
                <p class="text-sm text-muted-foreground">{{ paciente?.endereco || 'Não definido' }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-4">
          <h3 class="text-lg font-semibold">Resumo</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-muted p-4 text-center">
              <p class="text-3xl font-bold">{{ paciente?.totalConsultas || 0 }}</p>
              <p class="text-sm text-muted-foreground">Consultas</p>
            </div>
            <div class="rounded-lg bg-muted p-4 text-center">
              <p class="text-3xl font-bold">{{ paciente?.planosAtivos || 0 }}</p>
              <p class="text-sm text-muted-foreground">Planos Ativos</p>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-2">Próximo Agendamento</h4>
            <div v-if="paciente?.proximaConsulta" class="rounded-lg border p-3">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                  <span class="text-sm font-medium">{{ formatarData(paciente.proximaConsulta.data) }}</span>
                </div>
                <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {{ paciente.proximaConsulta.hora }}
                </span>
              </div>
              <div class="flex items-center text-sm text-muted-foreground">
                <User class="h-4 w-4 mr-2" />
                <span>Dr. {{ paciente.proximaConsulta.doutor }}</span>
              </div>
            </div>
            <div v-else class="rounded-lg border border-dashed p-4 text-center">
              <Calendar class="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">Sem consultas agendadas</p>
              <button class="inline-flex items-center px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus class="mr-1 h-3 w-3" /> Agendar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
