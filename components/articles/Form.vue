<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

type Categoria = {
  id: number;
  nome: string;
};

type ArtigoFormModel = {
  id?: number;
  codigo: string;
  descricao: string;
  categoria_id: number | null;
};

const props = defineProps<{
  id?: number;
  artigo?: ArtigoFormModel | null;
}>();

const emit = defineEmits<{
  (e: "save", artigo: any): void;
  (e: "cancel"): void;
}>();

const form = ref<ArtigoFormModel>({
  codigo: "",
  descricao: "",
  categoria_id: null,
});

const categorias = ref<Categoria[]>([]);
const loading = ref(false);
const saving = ref(false);
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

async function fetchCategorias() {
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}categorias`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    const data = await res.json();
    categorias.value = Array.isArray(data) ? data : [];
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar categorias.",
      variant: "destructive",
    });
  }
}

async function fetchArtigoById(id: number) {
  loading.value = true;
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}artigos/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar artigo");
    const data = await res.json();
    form.value = {
      id: data.id,
      codigo: data.codigo,
      descricao: data.descricao,
      categoria_id: data.categoria_id ?? (data.categoria?.id ?? null),
    };
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar artigo.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  saving.value = true;
  const token = useCookie("token").value;

  const payload = {
    codigo: form.value.codigo,
    descricao: form.value.descricao,
    categoria_id: form.value.categoria_id,
  };

  try {
    let res;
    if (props.id) {
      res = await fetch(`${baseUrl}artigos/${props.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${baseUrl}artigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    }
    if (!res.ok) throw new Error("Erro ao salvar artigo");
    const data = await res.json();
    toast({
      title: "Sucesso",
      description: "Artigo salvo com sucesso.",
    });
    emit("save", data);
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao salvar artigo.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.id, props.artigo],
  ([id, artigo]) => {
    if (typeof id === "number") {
      fetchArtigoById(id);
    } else if (artigo && typeof artigo === "object") {
      const categoria_id =
        artigo.categoria_id ??
        (typeof (artigo as any).categoria === "object"
          ? (artigo as any).categoria.id
          : null);

      form.value = {
        ...artigo,
        categoria_id,
      };
    } else {
      form.value = {
        codigo: "",
        descricao: "",
        categoria_id: null,
      };
    }
  },
  { immediate: true }
);

onMounted(fetchCategorias);

function onCancel() {
  emit("cancel");
}
</script>

<template>
  <div v-if="loading" class="py-8 text-center text-muted-foreground">
    Carregando dados do artigo...
  </div>
  <form
    v-else
    @submit.prevent="onSave"
    class="grid gap-4 py-4"
  >
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="codigo" class="text-right">Código</Label>
      <div class="col-span-3">
        <Input id="codigo" v-model="form.codigo" placeholder="Código do artigo" />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="descricao" class="text-right">Descrição</Label>
      <div class="col-span-3">
        <Input id="descricao" v-model="form.descricao" placeholder="Descrição do artigo" />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="categoria_id" class="text-right">Categoria</Label>
      <div class="col-span-3">
        <select
          id="categoria_id"
          v-model="form.categoria_id"
          class="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option :value="null" disabled>Selecione uma categoria</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome }}
          </option>
        </select>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel">Cancelar</Button>
      <Button type="submit" :disabled="saving">Guardar</Button>
    </DialogFooter>
  </form>
</template>