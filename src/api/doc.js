import { get, post, del } from './http'
export const docApi = {
  getById: (id) => get(`/api/docs/${id}`),
  search: (filter) => post('/api/docs/search', filter)
}
