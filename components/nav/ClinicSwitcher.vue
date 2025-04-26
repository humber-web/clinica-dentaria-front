<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronsUpDown, Users, Plus } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  teams: {
    id: number
    nome: string
    morada?: string
    email_envio?: string
  }[]
}>()
const showAddClinicModal = ref(false)
const { isMobile } = useSidebar()
const activeTeam = ref(props.teams[0])

function handleClinicSaved(newClinic) {
  showAddClinicModal.value = false
  // Optionally emit an event or refresh clinics list here
}

function handleClinicCancel() {
  showAddClinicModal.value = false
}

// Atualiza o activeTeam se a lista mudar
watch(
  () => props.teams,
  (val) => {
    if (val && val.length > 0) activeTeam.value = val[0]
  },
  { immediate: true }
)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Users class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {{ activeTeam?.nome || 'Selecione a clínica' }}
              </span>
              <span class="truncate text-xs">
                {{ activeTeam?.morada || activeTeam?.email_envio || '' }}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Clínicas
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(team, index) in teams"
            :key="team.id"
            class="gap-2 p-2"
            @click="activeTeam = team"
          >
            <div class="flex size-6 items-center justify-center rounded-sm border">
              <Users class="size-4 shrink-0" />
            </div>
            <div>
              <div class="font-semibold">{{ team.nome }}</div>
              <div class="text-xs text-muted-foreground">
                {{ team.morada || team.email_envio || '' }}
              </div>
            </div>
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2" @click="showAddClinicModal = true">
            <div class="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">
              Adicionar clínica
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
    <Dialog v-model:open="showAddClinicModal">
    <DialogContent>
      <ClinicsClinicForm
        @save="handleClinicSaved"
        @cancel="handleClinicCancel"
        :clinics="teams"
      />
    </DialogContent>
  </Dialog>
  </SidebarMenu>
</template>