import { get, post, put, del } from './http'

export const componentApi = {
  getTree: (projectId) => get(`/api/components/tree?projectId=${projectId}`)
}
