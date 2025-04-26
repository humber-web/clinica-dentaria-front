<script setup lang="ts">
import {
  Search,
  Plus,
  Edit,
  ShieldOff,
  CheckCircle,
  BadgePlus,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";

import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

type User = {
  id: number;
  username: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  bloqueado: boolean;
  perfil: {
    id: number;
    nome: string;
    perfil: string;
  } | null;
  clinicas: {
    clinica: {
      id: number;
      nome: string;
    };
  }[];
};

const nextId = (() => {
  let id = 21;
  return () => ++id;
})();

const users = ref<User[]>([]);

const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showAssignProfilesDialog = ref(false);
const showAssignClinicDialog = ref(false);

const selectedUser = ref<User | null>(null);
const selectedClinic = ref("");

/* profiles checkbox map */
const profileSelections = reactive<Record<string, boolean>>({});

async function fetchUsers() {
  const token = useCookie("token").value;
  try {
    const res = await fetch(`${baseUrl}utilizadores`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Erro ao buscar utilizadores");
    const data = await res.json();
    users.value = data;
  } catch (e) {
    toast({
      title: "Erro ao buscar utilizadores",
      description: e instanceof Error ? e.message : String(e),
    });
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / pageSize.value))
);

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

watch([filteredUsers, pageSize], () => (currentPage.value = 1));

function onUserCreated(newUser: User) {
  const { id, ...userWithoutId } = newUser;
  users.value.push({ id: nextId(), ...userWithoutId });
  showCreateDialog.value = false;
}

function openEdit(user: User) {
  selectedUser.value = user;
  showEditDialog.value = true;
}

async function toggleActive(user: User) {
  const token = useCookie("token").value;
  if (!token) {
    alert("Token não encontrado. Faça login novamente.");
    return;
  }

  // Choose endpoint based on current status
  const action = user.ativo ? "suspender" : "ativar";

  try {
    await fetch(`${baseUrl}utilizadores/${user.id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    user.ativo = !user.ativo;
    toast({
      title: `Utilizador ${user.ativo ? "ativado" : "suspenso"}!`,
      description: `O utilizador ${user.nome} foi ${
        user.ativo ? "ativado" : "suspenso"
      }.`,
    });
  } catch (e) {
    alert("Erro ao atualizar o estado do utilizador.");
  }
}

async function unblockUser(user: User) {
  const token = useCookie("token").value;
  if (!token) {
    toast({
      title: "Token não encontrado",
      description: "Faça login novamente.",
    });
    return;
  }

  try {
    await fetch(`${baseUrl}utilizadores/${user.id}/desbloquear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await fetch(`${baseUrl}utilizadores/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao buscar utilizador atualizado");
    const updatedUser = await res.json();

    const idx = users.value.findIndex((u) => u.id === user.id);
    if (idx !== -1) users.value[idx] = updatedUser;

    toast({
      title: "Utilizador desbloqueado!",
      description: `O utilizador ${updatedUser.nome} foi desbloqueado.`,
    });
  } catch (e) {
    toast({
      title: "Erro ao desbloquear o utilizador.",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  }
}
/* -------- assign profiles ---------------------------------------- */
function openAssignProfiles(user: User) {
  selectedUser.value = user;
  showAssignProfilesDialog.value = true;
}

function handleAssignProfilesClose() {
  showAssignProfilesDialog.value = false;
  selectedUser.value = null;
}

function handleAssignProfilesSaved(perfil: User["perfil"]) {
  if (selectedUser.value) {
    selectedUser.value.perfil = perfil;
  }
  handleAssignProfilesClose();
}

/* -------- assign clinic ------------------------------------------ */
function openAssignClinic(user: User) {
  selectedUser.value = user;
  showAssignClinicDialog.value = true;
}

function handleAssignClinicasSaved() {
  // if (selectedUser.value) selectedUser.value.clinicas = selectedClinic.value;
  closeAuxDialogs();
}

function closeAuxDialogs() {
  showAssignProfilesDialog.value = false;
  showAssignClinicDialog.value = false;
  selectedUser.value = null;
}

function onUserUpdated(updatedUser: User) {
  if (selectedUser.value) {
    Object.assign(selectedUser.value, updatedUser);
  }
  showEditDialog.value = false;
  selectedUser.value = null;
}


onMounted(fetchUsers);
</script>

<template>
  <div class="p-4 md:p-6 space-y-6">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <h1 class="text-2xl font-bold tracking-tight">Utilizadores</h1>

        <div class="flex items-center gap-2">
          <div class="relative w-full max-w-sm items-center">
            <Input
              id="search"
              type="text"
              placeholder="Pesquisar utilizadores"
              class="pl-10"
            />
            <span
              class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
            >
              <Search class="size-6 text-muted-foreground" />
            </span>
          </div>

          <Button
            @click="showCreateDialog = true"
            class="inline-flex items-center h-9 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90"
          >
            <Plus class="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>
      </div>
    </div>

    <UsersUserTable
      :users="paginatedUsers"
      @edit="openEdit"
      @toggle-active="toggleActive"
      @assign-profiles="openAssignProfiles"
      @assign-clinic="openAssignClinic"
      @unblock="unblockUser"
    />

    <div class="flex items-center justify-between px-2 py-4 border-t">
      <div class="text-sm text-muted-foreground">
        Mostrando
        {{ (currentPage - 1) * pageSize + 1 }}‑{{
          Math.min(currentPage * pageSize, filteredUsers.length)
        }}
        de {{ filteredUsers.length }} utilizadores
      </div>

      <div class="flex items-center space-x-2">
        <button
          class="icon-btn"
          :disabled="currentPage === 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <span class="text-sm font-medium">
          Página {{ currentPage }} de {{ pageCount }}
        </span>

        <button
          class="icon-btn"
          :disabled="currentPage === pageCount"
          @click="currentPage = Math.min(pageCount, currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </button>

        <select
          v-model.number="pageSize"
          class="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <UsersCreateUserForm
          @created="onUserCreated"
          @cancel="showCreateDialog = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showEditDialog">
      <DialogContent>
        <UsersAccountEditForm
          v-if="selectedUser"
          :user="selectedUser"
          @updated="onUserUpdated"
          @cancel="showEditDialog = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showAssignProfilesDialog">
      <DialogContent>
        <UsersAssignProfilesDialog
          v-if="selectedUser"
          :user="selectedUser"
          @close="handleAssignProfilesClose"
          @saved="handleAssignProfilesSaved"
        />
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="showAssignClinicDialog">
      <DialogContent>
        <UsersAssignClinicasDialog
          v-if="selectedUser"
          :user="selectedUser"
          @close="
            showAssignClinicDialog = false;
            selectedUser = null;
          "
          @saved="handleAssignClinicasSaved"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
