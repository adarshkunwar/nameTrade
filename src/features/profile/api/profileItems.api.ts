import axios from 'axios'
import type { TBaseUsernamesResponse } from '../types/basenames'

const BASENAMES_API_ENDPOINT = '/api/basenames/getUsernames'

export const PROFILE_ITEMS_API = {
  fetchProfileItems: async (address: string): Promise<TBaseUsernamesResponse> => {
    try {
      const response = await axios.get(BASENAMES_API_ENDPOINT, {
        params: {
          address,
          network: 'base-mainnet',
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = error.response?.data || error.message
        throw new Error(`Failed to fetch profile items: ${error.response?.status || 'Unknown'} ${errorText}`)
      }
      throw error
    }
  },
}
