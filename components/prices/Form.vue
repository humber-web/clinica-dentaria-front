<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface PriceFormModel {
  entidade_id: number
  valor_entidade: number
  valor_paciente: number
}

const props = defineProps<{
  modelValue: PriceFormModel
  artigoDescricao?: string
  disabledFields?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PriceFormModel): void
  (e: 'save', value: PriceFormModel): void
  (e: 'cancel'): void
}>()

const form = ref<PriceFormModel>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...val }
  }
)

function onSave() {
  emit('save', { ...form.value })
}
function onCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSave" class="grid gap-4 py-4">
    <div class="grid grid-cols-4 items-center gap-4">
      <FormLabel class="text-right">Artigo</FormLabel>
      <Input
        :value="artigoDescricao"
        class="col-span-3"
        disabled
      />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <FormLabel class="text-right">Entidade</FormLabel>
      <Input
        :value="`Entidade ${form.entidade_id}`"
        class="col-span-3"
        disabled
      />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <FormLabel class="text-right" for="valor_entidade">€ Entidade</FormLabel>
      <Input
        id="valor_entidade"
        v-model.number="form.valor_entidade"
        type="number"
        step="0.01"
        min="0"
        class="col-span-3"
        :disabled="disabledFields?.includes('valor_entidade')"
      />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <FormLabel class="text-right" for="valor_paciente">€ Paciente</FormLabel>
      <Input
        id="valor_paciente"
        v-model.number="form.valor_paciente"
        type="number"
        step="0.01"
        min="0"
        class="col-span-3"
        :disabled="disabledFields?.includes('valor_paciente')"
      />
    </div>
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel">Cancelar</Button>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </form>
</template>