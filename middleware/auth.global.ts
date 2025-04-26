export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('token').value
  if (!token && to.path !== '/login') return navigateTo('/login')
  if (!token && to.path === '/login') return

  const config = useRuntimeConfig()
  const { data: user, error } = await useFetch<{ perfil: { perfil: string } | null }>(
    `${config.public.apiBase}utilizadores/me`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  // If fetch failed or user is not found, redirect to login (and avoid loop)
  if (error.value || !user.value || !user.value.perfil) {
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  const perfil = user.value.perfil.perfil

  if (to.path.startsWith('/doctor') && perfil !== 'doctor') {
    return navigateTo('/')
  }
  if (to.path.startsWith('/master') && perfil !== 'master_admin') {
    return navigateTo('/')
  }
  if (to.path.startsWith('/diretor') && perfil !== 'gerente' && perfil !== 'diretor') {
    return navigateTo('/')
  }
  if (to.path.startsWith('/assistant') && perfil !== 'assistant') {
    return navigateTo('/')
  }
})