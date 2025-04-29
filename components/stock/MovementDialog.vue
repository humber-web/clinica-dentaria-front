<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "@/components/ui/toast";
import DatePicker from "../ui/date-picker/DatePicker.vue";
import { type DateValue, parseDate } from "@internationalized/date";

const props = defineProps<{
  open: boolean;
  items: { id: number; nome: string }[];
  defaultItemId?: number | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const show = ref(props.open);
const selectedItemId = ref<number | null>(props.defaultItemId ?? null);
const tipo = ref("");
const quantidade = ref<number | null | undefined>(undefined);
const justificacao = ref("");
const user = useState<{ id: number } | null>("user");
const lote = ref("");
// Accept any type for validade to match DatePicker's emitted value
const validade = ref<any>(undefined);

watch(
  () => props.open,
  (val) => (show.value = val)
);

watch(
  () => show.value,
  (val) => {
    if (!val) emit("close");
  }
);

function resetForm() {
  selectedItemId.value = props.defaultItemId ?? null;
  tipo.value = "";
  quantidade.value = undefined;
  justificacao.value = "";
  lote.value = "";
  validade.value = undefined;
}

async function save() {
  const utilizador_id = user.value?.id;
  if (!utilizador_id) {
    useToast().toast({
      title: "Erro",
      description: "Utilizador não autenticado.",
      variant: "destructive",
    });
    return;
  }

  try {
    const token = useCookie("token").value;
    const payload: any = {
      item_id: selectedItemId.value,
      tipo_movimento: tipo.value,
      quantidade: Number(quantidade.value),
      justificacao: justificacao.value,
      utilizador_id,
    };
    // Only add lote/validade if tipo is entrada
    if (tipo.value === "entrada") {
      payload.lote = lote.value;
      payload.validade = validade.value
        ? validade.value.toString() // or format as needed
        : "";
    }

    const res = await fetch(
      `${useRuntimeConfig().public.apiBase}stock/movimentos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Erro ao registar movimento");

    emit("saved");
    show.value = false;
    resetForm();
  } catch (e) {
    useToast().toast({
      title: "Erro",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  }
}
</script>

<template>
  <Dialog v-model:open="show">
    <DialogContent class="max-w-md w-full">
      <DialogHeader>
        <DialogTitle>Novo Movimento</DialogTitle>
        <DialogDescription>
          Registe uma entrada, saída ou ajuste de stock
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="movement-item">Item</Label>
          <Select v-model="selectedItemId">
            <SelectTrigger id="movement-item">
              <SelectValue placeholder="Selecionar Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in items" :key="item.id" :value="item.id">
                {{ item.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="movement-type">Tipo de Movimento</Label>
            <Select v-model="tipo">
              <SelectTrigger id="movement-type">
                <SelectValue placeholder="Tipo de Movimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
                  <div class="space-y-2">
          <Label for="movement-quantity">Quantidade</Label>
          <NumberField
            id="movement-quantity"
            v-model="quantidade"
            :min="1"
            :default-value="1"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
        </div>
        <!-- Show lote and validade only for entrada -->
        <div
          v-if="tipo === 'entrada'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div class="space-y-2">
            <Label for="movement-lote">Lote</Label>
            <Input
              id="movement-lote"
              v-model="lote"
              placeholder="Código do lote"
              required
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <Label for="movement-validade">Validade</Label>
            <!-- For pass date -->
            <!-- <DatePicker
              :maxValue="parseDate(new Date().toISOString().slice(0, 10))"
              v-model="validade"
            /> -->
            <DatePicker
              :minValue="parseDate(new Date().toISOString().slice(0, 10))"
              v-model="validade"
              yearSort="asc"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="movement-reason">Justificação</Label>
          <Textarea
            id="movement-reason"
            placeholder="Motivo do movimento"
            v-model="justificacao"
          />
        </div>
      </div>
      <DialogFooter class="gap-2">
        <Button variant="outline" type="button" @click="show = false">
          Cancelar
        </Button>
        <Button type="button" @click="save">Registar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
