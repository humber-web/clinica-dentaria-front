<script setup lang="ts">
import { Pencil, Plus, ChevronDown } from "lucide-vue-next";

interface Preco {
  entidade_id: number;
  valor_entidade: number;
  valor_paciente: number;
}
interface Categoria {
  id: number;
  nome: string;
}
interface Artigo {
  id: number;
  codigo: string;
  descricao: string;
  categoria: Categoria;
  precos: Preco[];
}

const props = defineProps<{
  artigos: Artigo[];
  expandedRows: number[];
  selectedEntity: string;
}>();

const emit = defineEmits<{
  (e: "toggleExpanded", id: number): void;
  (e: "addPrice", artigo: Artigo): void;
  (e: "editPrice", artigo: Artigo, preco: Preco): void;
}>();

function hasEntityPrice(artigo: Artigo): boolean {
  if (props.selectedEntity === "all") return true;
  const entityId = parseInt(props.selectedEntity);
  return artigo.precos.some((p) => p.entidade_id === entityId);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
  }).format(value);
}
</script>

<template>
  <div class="rounded-md border shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]"></TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Entidades</TableHead>
            <TableHead class="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="artigo in artigos" :key="artigo.id">
            <TableRow>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0"
                  @click="emit('toggleExpanded', artigo.id)"
                >
                  <ChevronDown
                    :class="[
                      'h-4 w-4 transition-transform',
                      props.expandedRows.includes(artigo.id) ? 'rotate-180' : '',
                    ]"
                  />
                </Button>
              </TableCell>
              <TableCell>{{ artigo.codigo }}</TableCell>
              <TableCell>{{ artigo.descricao }}</TableCell>
              <TableCell>{{ artigo.categoria.nome }}</TableCell>
              <TableCell>
                <div class="flex items-center">
                  <Badge variant="secondary">{{ artigo.precos.length }}</Badge>
                  <Button
                    v-if="!hasEntityPrice(artigo)"
                    variant="outline"
                    size="sm"
                    class="ml-2"
                    @click="emit('addPrice', artigo)"
                  >
                    <Plus class="h-4 w-4 mr-1" />
                    Add Price
                  </Button>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="emit('toggleExpanded', artigo.id)"
                >
                  <ChevronDown
                    :class="[
                      'h-4 w-4 transition-transform',
                      props.expandedRows.includes(artigo.id) ? 'rotate-180' : '',
                    ]"
                  />
                  {{
                    props.expandedRows.includes(artigo.id)
                      ? "Fechar"
                      : "Ver preços"
                  }}
                </Button>
              </TableCell>
            </TableRow>
            <!-- Expanded Row -->
            <TableRow v-if="props.expandedRows.includes(artigo.id)">
              <TableCell colspan="6" class="p-0">
                <div class="p-4 bg-muted/20">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entidade</TableHead>
                        <TableHead>CVE Entidade</TableHead>
                        <TableHead>CVE Paciente</TableHead>
                        <TableHead class="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow
                        v-for="preco in artigo.precos"
                        :key="`${artigo.id}-${preco.entidade_id}`"
                      >
                        <TableCell>Entidade {{ preco.entidade_id }}</TableCell>
                        <TableCell>{{ formatCurrency(preco.valor_entidade) }}</TableCell>
                        <TableCell>{{ formatCurrency(preco.valor_paciente) }}</TableCell>
                        <TableCell class="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="emit('editPrice', artigo, preco)"
                          >
                            <Pencil class="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow v-if="artigo.precos.length === 0">
                        <TableCell
                          colspan="4"
                          class="text-center text-muted-foreground py-4"
                        >
                          Nenhum preço definido para este artigo.
                        </TableCell>
                      </TableRow>
                      <TableRow
                        v-if="props.selectedEntity !== 'all' && !hasEntityPrice(artigo)"
                        class="bg-muted/30"
                      >
                        <TableCell>Entidade {{ props.selectedEntity }}</TableCell>
                        <TableCell colspan="2" class="text-muted-foreground">
                          Preço não definido
                        </TableCell>
                        <TableCell class="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            @click="emit('addPrice', artigo)"
                          >
                            <Plus class="h-4 w-4 mr-1" />
                            Add Price
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-if="!artigos.length">
            <TableCell
              colspan="6"
              class="text-center py-6 text-muted-foreground"
            >
              Nenhum artigo encontrado com os filtros selecionados.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>