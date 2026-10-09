import { get, post, put, del } from './http'

export const tagApi = {
  search: (filter) => get('/api/tags', { params: filter })
}
