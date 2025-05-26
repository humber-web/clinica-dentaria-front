import { ref, computed, watch } from 'vue'
import { useMarcacoes } from '~/composables/useMarcacao'
import { usePacientes }  from '~/composables/usePacientes'
import type { UtilizadorResponse } from '~/types/utilizador'
import type { Clinica } from '~/types/clinica'

export function useDoctorDashboard(loggedUser: UtilizadorResponse|null, clinic: Clinica|null) {
  const { events, fetchMarcacoes } = useMarcacoes()
  const { pacientes, fetchPacientes } = usePacientes()

  const proximasConsultas = computed(() =>
    events.value
      .filter(e => e.medico_id === loggedUser?.id)
      .sort((a,b) => a.start.getTime() - b.start.getTime())
      .slice(0, 1)
  )

  const estatisticas = computed(() => ({
    consultasHoje: events.value.filter(e =>
      e.medico_id === loggedUser?.id &&
      new Date(e.start).toDateString() === new Date().toDateString()
    ).length,
    pendentes: events.value.filter(e => e.estado === 'rascunho').length,
    faltas:    events.value.filter(e => e.estado === 'falta').length,
  }))

  function loadAll() {
    if (clinic?.id && loggedUser?.id) {
      fetchMarcacoes(clinic.id, loggedUser.id)
      fetchPacientes(clinic.id)
    }
  }

  // Carrega sempre que mudar utilizador ou clínica
  watch([() => clinic?.id, () => loggedUser?.id], loadAll, { immediate: true })

  return { proximasConsultas, estatisticas, pacientes }
}
