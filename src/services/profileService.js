import api from './api'

export const profileService = {
  async updateProfile(userId, profile) {
    const { data } = await api.put(`/api/v1/users/${userId}`, profile)

    return data
  },
}