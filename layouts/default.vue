<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const breadcrumbMap: Record<string, string> = {
// Master Section Breadcrumbs
  "/master/clinics": "Gerir Clínicas",
  "/master/users": "Gerir Utilizadores",
  "/master/clinics/settings": "Configurações",
  "/master/stock": "Gerir Stock",
  "/master/reports": "Relatórios",
  "/master/patients": "Gerir Pacientes",
  "/master/patient": "Gerir Pacientes",
  "/master/settings/entities": "Entidades",
  "/master/settings/categories": "Categorias",
  "/master/settings/articles": "Artigos",
  "/master/settings/prices": "Preços",
  "/master/orcamentos": "Orcamentos",
  "/master/marcacoes": "Marcações",

// Doctor Section Breadcrumbs
  "/doctor": "Início",
  "/doctor/schedule": "Agenda",
  "/doctor/patients": "Pacientes",
  "/doctor/reports": "Relatórios",
  "/doctor/settings": "Definições",


  // front desk Section Breadcrumbs
  "/frontdesk": "Início",
  "/frontdesk/marcacoes": "Agenda",
  "/frontdesk/search": "Pesquisar",
  "/frontdesk/settings": "Definições",
  "/frontdesk/patients": "Pacientes",
  "/frontdesk/orcamentos": "Orcamentos",
  "/frontdesk/caixa": "Caixa",
  "/pacient": "Pacientes",
};

const mainSection = computed(() => {
  // Match both /master/clinics and /master/clinic/:id
  if (route.path.startsWith("/master/clinics")) return "/master/clinics";
  if (route.path.match(/^\/master\/clinic\/\d+/)) return "/master/clinics";
  if (route.path.startsWith("/master/users")) return "/master/users";
  if (route.path.match(/^\/master\/patient\/\d+$/)) return "/master/patients";
   if (route.path.match(/^\/frontdesk\/patient\/\d+$/)) return "/frontdesk/patients";
  if (route.path.startsWith("/master/patients")) return "/master/patients";
  return route.path;
});

const mainBreadcrumbText = computed(
  () => breadcrumbMap[mainSection.value] || mainSection.value
);

const subpageBreadcrumbText = computed(() => {
  if (route.path.match(/^\/master\/clinic\/\d+\/settings/)) return 'Configurações'
  if (route.path.match(/^\/master\/patient\/\d+$/)) return 'Detalhes'
  if (route.path.match(/^\/frontdesk\/patient\/\d+$/)) return 'Detalhes'
  return ''
})
</script>

<template>
  <SidebarProvider>
    <NavAppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink as-child>
                  <NuxtLink :to="mainSection">
                    {{ mainBreadcrumbText }}
                  </NuxtLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                class="hidden md:block"
                v-if="subpageBreadcrumbText"
              />
              <BreadcrumbItem v-if="subpageBreadcrumbText">
                <BreadcrumbPage>{{ subpageBreadcrumbText }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
