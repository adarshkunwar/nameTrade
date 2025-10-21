import axios from 'axios'
import { USERNAME_ACTIVITY_ENDPOINT, USERNAME_ACTIVITY_QUERY } from '../constant/query.const'
import type { UsernameActivityResponse, UsernameActivityVariables } from '../types/query'

export const USERNAME_ACTIVITY_API = {
  async fetchActivity(
    variables: UsernameActivityVariables
  ): Promise<UsernameActivityResponse['itemActivity']> {
    try {
      const response = await axios.post(
        USERNAME_ACTIVITY_ENDPOINT,
        {
          query: USERNAME_ACTIVITY_QUERY,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )

      const payload: { data?: UsernameActivityResponse; errors?: { message?: string }[] } = response.data

      if (payload.errors?.length) {
        const [firstError] = payload.errors
        throw new Error(firstError?.message ?? 'Unknown GraphQL error')
      }

      if (!payload.data?.itemActivity) {
        throw new Error('Malformed response from username activity query')
      }

      return payload.data.itemActivity
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = error.response?.data || error.message
        throw new Error(`Failed to fetch username activity: ${error.response?.status || 'Unknown'} ${errorText}`)
      }

      throw error
    }
  },
}
