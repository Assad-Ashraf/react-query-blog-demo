import React from 'react'
import axios from 'axios'
import { useQuery } from 'react-query'
export default function usePosts() {
  // const [state, setState] = React.useReducer((_, action) => action, {
  //   isLoading: true,
  // })

  return useQuery(
    'posts',
    async () => await axios.get('/api/posts').then((res) => res.data)
  )
  // const fetch = async () => {
  //   setState({ isLoading: true })
  //   try {
  //     const data = await axios.get('/api/posts').then((res) => res.data)
  //     setState({ isSuccess: true, data })
  //   } catch (error) {
  //     setState({ isError: true, error })
  //   }
  // }

  // React.useEffect(() => {
  //   fetch()
  // }, [])

  // react query return structure
  // return {
  //   ...state,
  //   fetch,
  // }
}
