import { get, put } from './http'

export const settingApi = {
  getCurrent: () => get('/api/settings'),
  updateCurrent: (setting) => put('/api/settings', setting)
}
