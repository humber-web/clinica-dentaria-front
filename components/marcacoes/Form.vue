<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogTitle class="mb-4">
        {{ mode === 'create' ? 'Nova Marcação' : 'Editar Marcação' }}
      </DialogTitle>

      <!-- Cartão de Ações e Detalhes (Edit Mode) -->
      <div v-if="mode==='edit'" class="p-4 rounded-md mb-6 shadow-sm border">
        <h3 class="text-sm font-semibold mb-2">Detalhes da Marcação</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs opacity-70">Início</p>
            <p class="font-medium">{{ eventData?.start ? formatDateTime(eventData.start) : '' }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Fim</p>
            <p class="font-medium">{{ eventData?.end ? formatDateTime(eventData.end) : '' }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Paciente</p>
            <p class="font-medium">{{ eventData?.title || '' }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Entidade</p>
            <p class="font-medium">{{ eventData?.entidade?.nome || '' }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs opacity-70">Telefone</p>
            <p class="font-medium">{{ eventData?.paciente?.telefone || '' }}</p>
          </div>
        </div>
        <!-- Ações Principais em destaque -->
        <div class="flex gap-2 mt-4">
          <Button variant="default" @click="consultaStart">Iniciar Consulta</Button>
          <Button variant="outline" @click="extendEvent">Estender +30 min</Button>
          <Button variant="destructive" @click="failAppointment">Indicar Falha</Button>
        </div>
      </div>

      <!-- Formulário editável -->
      <div class="space-y-4">
        <FormField name="titulo">
          <FormLabel for="titulo">Título (Paciente)</FormLabel>
          <Input id="titulo" v-model="title" :readonly="mode==='edit'" />
        </FormField>

        <FormField name="observacoes">
          <FormLabel for="observacoes">Observações</FormLabel>
          <Textarea
            id="observacoes"
            v-model="observacoes"
            rows="4"
            placeholder="Insira observações…"
          />
        </FormField>
      </div>

      <!-- Footer com ações secundárias -->
      <DialogFooter class="mt-6 flex justify-end gap-2">
        <Button variant="outline" @click="cancel">Cancelar</Button>
        <Button
          v-if="mode==='create'"
          @click="confirm"
          :disabled="!title"
        >
          Criar
        </Button>
        <Button
          v-else
          @click="confirm"
          :disabled="!isDirty"
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { VueCalEvent } from '~/types/marcacao'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { FormField, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Props e emits
const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  mode:         { type: String as PropType<'create'|'edit'>, default: 'create' },
  defaultTitle: { type: String, default: '' },
  eventData:    { type: Object as PropType<VueCalEvent|null>, default: null }
})
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'update-event',
  'extend-event',
  'consulta-start',
  'fail-appointment'
])

// Estado do modal
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

// Campos editáveis
const title = ref('')
const observacoes = ref('')

// Valores iniciais para detectar mudanças
const initialTitle = ref('')
const initialObservacoes = ref('')

// Ao abrir, inicializa campos
watch(open, isOpen => {
  if (!isOpen) return
  if (props.mode === 'create') {
    title.value = props.defaultTitle
    observacoes.value = ''
    initialTitle.value = ''
    initialObservacoes.value = ''
  } else if (props.eventData) {
    title.value = props.eventData.title || ''
    observacoes.value = props.eventData.observacoes || ''
    initialTitle.value = title.value
    initialObservacoes.value = observacoes.value
  }
})

// Computed para saber se algo mudou
const isDirty = computed(() => {
  if (props.mode === 'create') {
    return title.value.trim().length > 0
  }
  return title.value !== initialTitle.value || observacoes.value !== initialObservacoes.value
})

// Ações
function cancel() { open.value = false }
function confirm() {
  if (props.mode === 'create') {
    emit('confirm', { title: title.value, observacoes: observacoes.value })
  } else {
    emit('update-event', { event: props.eventData, observacoes: observacoes.value })
  }
  open.value = false
}
function extendEvent()   { emit('extend-event', props.eventData) }
function consultaStart() { emit('consulta-start', props.eventData) }
function failAppointment() { emit('fail-appointment', props.eventData) }

// Helper de formatação usando toLocale
function formatDateTime(dt: Date) {
  const data = dt.toLocaleDateString('pt-PT')
  const hora = dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  return `${data} às ${hora}`
}
</script>
