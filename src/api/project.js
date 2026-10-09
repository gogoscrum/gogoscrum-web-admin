import { get, post, put, del } from './http'
export const projectApi = {
  create: (project) => post('/api/projects', project),
  update: (projectId, project) => put(`/api/projects/${projectId}`, project),
  getById: (id) => get(`/api/projects/${id}`),
  search: (filter) => post('/api/projects/search', filter),
  delete: (id) => del(`/api/projects/${id}`),
  transferTo: (projectId, userId) => put(`/api/projects/${projectId}/owner?userId=${userId}`),
  archive: (id) => post(`/api/projects/${id}/archive`),
  unarchive: (id) => del(`/api/projects/${id}/archive`),
  updateAvatar: (projectId, file) => put(`/api/projects/${projectId}/avatar`, file),
  deleteAvatar: (projectId) => del(`/api/projects/${projectId}/avatar`),
  getProjectVelocity: (projectId) => get(`/api/projects/${projectId}/velocity`),
  // Member related APIs
  createMember: (projectId, member) => post(`/api/projects/${projectId}/members`, member),
  deleteMember: (projectId, memberId) => del(`/api/projects/${projectId}/members/${memberId}`),
  quit: (projectId) => del(`/api/projects/${projectId}/members/myself`),
  setAsGuest: (projectId, memberId) => put(`/api/projects/${projectId}/members/${memberId}/guest`),
  setAsDeveloper: (projectId, memberId) => put(`/api/projects/${projectId}/members/${memberId}/developer`),

  getByProjectIdAndUserId: (projectId) => get(`/api/members/project/${projectId}`),

  findMembersByInvitation: (projectId, invitationId, page, pageSize) =>
    get(`/api/projects/${projectId}/members`, {
      params: {
        invitationId: invitationId,
        page: page,
        pageSize: pageSize
      }
    })
}
