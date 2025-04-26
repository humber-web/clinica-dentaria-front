<script setup lang="ts">

const route = useRoute()

const breadcrumbMap: Record<string, string> = {
  '/master/clinics': 'Manage Clinics',
  '/master/users': 'Manage Users',
  // add more as needed
}

const breadcrumbText = computed(() =>
  Object.entries(breadcrumbMap).find(([key]) =>
    route.path.startsWith(key)
  )?.[1] || route.path
)
</script>

<template>
  <SidebarProvider>
    <NavAppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink as-child>
                  <NuxtLink :to="route.path">
                    {{ breadcrumbText }}
                  </NuxtLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <!-- Optionally, add a separator and a page label if you have subpages -->
              
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Current Subpage</BreadcrumbPage>
              </BreadcrumbItem>
             
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>