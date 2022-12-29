import axios from 'axios'
import { useQuery, queryCache } from 'react-query'
export default function usePosts() {
  return useQuery(
    'posts',
    async () => await axios.get('/api/posts').then((res) => res.data),
    {
      onSuccess: (data) => queryCache.invalidateQueries(['posts', data.id]),
    }
  )
}
