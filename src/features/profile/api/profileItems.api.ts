import axios from 'axios'
import { PROFILE_ITEMS_ENDPOINT, PROFILE_ITEMS_LIST_QUERY } from '../constant/query.const'
import type { ProfileItemsListResponse, ProfileItemsListVariables } from '../types/query'

export const PROFILE_ITEMS_API = {
  fetchProfileItems: async (
    variables: ProfileItemsListVariables
  ): Promise<ProfileItemsListResponse['profileItems']> => {
    try {
      const response = await axios.post(
        PROFILE_ITEMS_ENDPOINT,
        {
          query: PROFILE_ITEMS_LIST_QUERY,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )

      const payload: { data?: ProfileItemsListResponse; errors?: { message?: string }[] } = response.data

      if (payload.errors?.length) {
        const [firstError] = payload.errors
        throw new Error(firstError?.message ?? 'Unknown GraphQL error')
      }

      if (!payload.data?.profileItems) {
        throw new Error('Malformed response from profile items query')
      }

      return payload.data.profileItems
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = error.response?.data || error.message
        throw new Error(`Failed to fetch profile items: ${error.response?.status || 'Unknown'} ${errorText}`)
      }
      throw error
    }
  },
}
