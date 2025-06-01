export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('token').value
  if (!token && to.path !== '/login') return navigateTo('/login')
  if (!token && to.path === '/login') return

  const config = useRuntimeConfig()
  const userState = useState<any>('user', () => null)
  
  // Only fetch if we don't have user data yet or we're refreshing
  if (!userState.value || to.query.refresh) {
    try {
      const { data: user } = await useFetch<any>(
        `${config.public.apiBase}utilizadores/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (!user.value || !user.value.perfil) {
        // Clear invalid session
        useCookie('token').value = null
        userState.value = null
        if (to.path !== '/login') return navigateTo('/login')
        return
      }
      
      // Update global user state
      userState.value = user.value
      
      // Route protection based on role
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
    } catch (error) {
      // Handle fetch error
      useCookie('token').value = null
      userState.value = null
      if (to.path !== '/login') return navigateTo('/login')
    }
  }
})