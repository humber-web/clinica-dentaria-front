<script setup lang="ts">
import {
  ref, reactive, computed, watch, onMounted
} from 'vue'
import {
  ChevronDown, ChevronLeft, ChevronRight, Check
} from 'lucide-vue-next'
import { useToast }      from '@/components/ui/toast'
import PricesTable       from '@/components/prices/Table.vue'
import PricesForm        from '@/components/prices/Form.vue'

/* ─── Tipos ─────────────────────────────────────────────── */
interface Categoria { id: number; nome: string }
interface Entidade  { id: number; nome: string }
interface Preco     { entidade_id: number; valor_entidade: number; valor_paciente: number }
interface Artigo    {
  id: number; codigo: string; descricao: string;
  categoria: Categoria; precos: Preco[]
}

/* ─── Estado base ──────────────────────────────────────── */
const artigos    = ref<Artigo[]>([])
const categorias = ref<Categoria[]>([])
const entidades  = ref<Entidade[]>([])

/* UI state */
const selectedCategory = ref<string>('all')
const selectedEntity   = ref<string>('all')
const currentPage      = ref(1)
const pageSize         = ref(10)
const expandedRows     = ref<number[]>([])

const showPriceModal   = ref(false)
const isEditing        = ref(false)
const currentArtigo    = ref<Artigo | null>(null)
const currentPrice     = ref<Preco  | null>(null)
const originalPrice    = ref<Preco  | null>(null)

/* ─── Utilidades ───────────────────────────────────────── */
const { toast }  = useToast()
const baseUrl    = useRuntimeConfig().public.apiBase

function authHeader () {
  const token = useCookie('token').value
  return { Authorization: `Bearer ${token}` }
}

function formatCurrency (v: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2
  }).format(v)
}

/* ─── Fetchers ─────────────────────────────────────────── */
async function fetchCategorias () {
  try {
    const r = await fetch(`${baseUrl}categorias`, { headers: authHeader() })
    if (!r.ok) throw new Error('Erro ao buscar Categorias')
    categorias.value = await r.json()
  } catch (e) {
    toast({ title: 'Erro ao buscar categorias', description: (e as Error).message })
  }
}

async function fetchEntidades () {
  try {
    const r = await fetch(`${baseUrl}entidades`, { headers: authHeader() })
    if (!r.ok) throw new Error('Erro ao buscar Entidades')
    entidades.value = await r.json()
  } catch (e) {
    toast({ title: 'Erro ao buscar entidades', description: (e as Error).message })
  }
}

async function fetchArtigos () {
  try {
    const r = await fetch(`${baseUrl}artigos`, { headers: authHeader() })
    if (!r.ok) throw new Error('Erro ao buscar Artigos')
    artigos.value = await r.json()
  } catch (e) {
    toast({ title: 'Erro ao buscar artigos', description: (e as Error).message })
  }
}

/* ─── Options dos selects ─────────────────────────────── */
const categoryOptions = computed(() => [
  'all',
  ...categorias.value.map(c => c.nome)
])

const entityOptions = computed(() => [
  'all',
  ...entidades.value.map(e => e.id.toString())
])

const entidadeById = computed<Record<number, string>>(() =>
  Object.fromEntries(entidades.value.map(e => [e.id, e.nome]))
)

/* ─── Filtros & paginação ─────────────────────────────── */
const filteredArtigos = computed(() => {
  let list = [...artigos.value]
  if (selectedCategory.value !== 'all')
    list = list.filter(a => a.categoria.nome === selectedCategory.value)

  if (selectedEntity.value !== 'all') {
    const eid = Number(selectedEntity.value)
    list = list.filter(a => a.precos.some(p => p.entidade_id === eid))
  }
  return list
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredArtigos.value.length / pageSize.value))
)

const paginatedArtigos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredArtigos.value.slice(start, start + pageSize.value)
})

watch([selectedCategory, selectedEntity, pageSize], () => currentPage.value = 1)
watch(totalPages, p => { if (currentPage.value > p) currentPage.value = p })

/* ─── Helpers UI (expand / modal) ─────────────────────── */
function toggleExpanded (id: number) {
  const i = expandedRows.value.indexOf(id)
  i === -1 ? expandedRows.value.push(id) : expandedRows.value.splice(i, 1)
}

function openAddPriceModal (artigo: Artigo) {
  currentArtigo.value = artigo
  isEditing.value     = false
  currentPrice.value  = {
    entidade_id: selectedEntity.value !== 'all'
      ? Number(selectedEntity.value)
      : entidades.value[0]?.id ?? 0,
    valor_entidade : 0,
    valor_paciente : 0
  }
  showPriceModal.value = true
}

function openEditPriceModal (artigo: Artigo, preco: Preco) {
  currentArtigo.value = artigo
  originalPrice.value = { ...preco }
  currentPrice.value  = { ...preco }
  isEditing.value     = true
  showPriceModal.value = true
}

function closePriceModal () { showPriceModal.value = false }

/* Salvar (simulado em memória) */
function savePrice () {
  if (!currentArtigo.value || !currentPrice.value) return
  const art = artigos.value.find(a => a.id === currentArtigo.value!.id)
  if (!art) return

  const idx = art.precos.findIndex(p => p.entidade_id === currentPrice.value!.entidade_id)

  if (isEditing.value) {
    if (idx !== -1) art.precos[idx] = { ...currentPrice.value }
  } else {
    if (idx !== -1) {
      toast({ title: 'Preço já existente', variant: 'destructive' })
      return
    }
    art.precos.push({ ...currentPrice.value })
  }

  toast({ title: 'Sucesso', description: 'Preço actualizado' })
  closePriceModal()
}

/* ─── Life‑cycle ───────────────────────────────────────── */
onMounted(() => {
  fetchCategorias()
  fetchEntidades()
  fetchArtigos()
})
</script>

<template>
  <div class="container mx-auto p-4 md:p-6 space-y-6">
    <!-- Cabeçalho -->
    <h1 class="text-2xl font-bold tracking-tight">Gestão de Preços</h1>

    <!-- Filtros -->
    <Form class="bg-card rounded-lg border shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Categoria -->
        <div class="space-y-2">
          <FormLabel>Categoria</FormLabel>
          <Select v-model="selectedCategory" :options="categoryOptions">
            <template #trigger>
              <Button variant="outline" class="w-full justify-between">
                {{ selectedCategory !== 'all' ? selectedCategory : 'Todas as categorias' }}
                <ChevronDown class="ml-2 h-4 w-4 opacity-50"/>
              </Button>
            </template>
            <template #content>
              <Command>
                <CommandGroup>
                  <CommandItem
                    v-for="opt in categoryOptions"
                    :key="opt" :value="opt" @select="selectedCategory = opt"
                  >
                    <Check class="mr-2 h-4 w-4" :class="selectedCategory===opt?'opacity-100':'opacity-0'"/>
                    {{ opt === 'all' ? 'Todas' : opt }}
                  </CommandItem>
                </CommandGroup>
              </Command>
            </template>
          </Select>
        </div>

        <!-- Entidade -->
        <div class="space-y-2">
          <FormLabel>Entidade</FormLabel>
          <Select v-model="selectedEntity" :options="entityOptions">
            <template #trigger>
              <Button variant="outline" class="w-full justify-between">
                {{
                  selectedEntity !== 'all'
                    ? entidadeById[selectedEntity]
                    : 'Todas as entidades'
                }}
                <ChevronDown class="ml-2 h-4 w-4 opacity-50"/>
              </Button>
            </template>
            <template #content>
              <Command>
                <CommandGroup>
                  <CommandItem
                    v-for="opt in entityOptions"
                    :key="opt" :value="opt" @select="selectedEntity = opt"
                  >
                    <Check class="mr-2 h-4 w-4" :class="selectedEntity===opt?'opacity-100':'opacity-0'"/>
                    {{ opt === 'all' ? 'Todas as entidades' : entidadeById[opt] }}
                  </CommandItem>
                </CommandGroup>
              </Command>
            </template>
          </Select>
        </div>
      </div>
    </Form>

    <!-- Tabela -->
    <PricesTable
      :artigos="paginatedArtigos"
      :expanded-rows="expandedRows"
      :selected-entity="selectedEntity"
      :entidade-by-id="entidadeById"
      :format-currency="formatCurrency"
      @toggleExpanded="toggleExpanded"
      @addPrice="openAddPriceModal"
      @editPrice="openEditPriceModal"
    />

    <!-- Paginação -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Mostrando
        {{ (currentPage-1)*pageSize + 1 }}‑
        {{ Math.min(currentPage*pageSize, filteredArtigos.length) }}
        de {{ filteredArtigos.length }} artigos
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Registos por página</p>
          <Select v-model="pageSize" :options="[10,20,50]">
            <template #trigger>
              <Button variant="outline" class="h-8 w-[70px]">
                {{ pageSize }}
                <ChevronDown class="ml-2 h-4 w-4 opacity-50"/>
              </Button>
            </template>
          </Select>
        </div>
        <div class="flex items-center space-x-2">
          <Button variant="outline" size="sm" class="h-8 w-8 p-0"
            :disabled="currentPage===1"
            @click="currentPage--">
            <ChevronLeft class="h-4 w-4"/>
          </Button>
          <div class="text-sm font-medium">Página {{ currentPage }} de {{ totalPages }}</div>
          <Button variant="outline" size="sm" class="h-8 w-8 p-0"
            :disabled="currentPage===totalPages"
            @click="currentPage++">
            <ChevronRight class="h-4 w-4"/>
          </Button>
        </div>
      </div>
    </div>

    <!-- Modal Preço -->
    <Dialog v-model:open="showPriceModal">
      <DialogContent class="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Editar Preço' : 'Adicionar Preço' }}</DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? 'Atualize os valores para este artigo e entidade.'
                : 'Defina os valores para este artigo e entidade.'
            }}
          </DialogDescription>
        </DialogHeader>

        <PricesForm
          v-if="currentPrice && currentArtigo"
          :model-value="currentPrice"
          :entidades="entidades"
          :artigo-descricao="currentArtigo.descricao"
          @update:modelValue="val => currentPrice = val"
          @save="savePrice"
          @cancel="closePriceModal"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
