import { get, post, put, del } from './http'
export const testCaseApi = {
  search: (filter) => post('/api/testing/cases/search', filter)
}

export const testPlanApi = {
  search: (filter) => post('/api/testing/plans/search', filter)
}
