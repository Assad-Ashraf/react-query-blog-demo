import React from 'react'
import axios from 'axios'
import { queryCache, useMutation } from 'react-query'

export default function useCreatePost() {
  return useMutation(
    (values) => axios.post('/api/posts', values).then((res) => res.data),
    {
      onMutate: (newPost) => {
        const oldPostsSnapshot = queryCache.getQueryData('posts')
        queryCache.setQueryData('posts', (old) => [...old, newPost])

        // return oldPostsSnapshot
        // to make it more encasulated
        return () => queryCache.setQueryData('posts', oldPostsSnapshot)
      },
      onSuccess: () => {
        queryCache.invalidateQueries('posts')
      },
      onError: (error, _newPost, rollbackFunction) => {
        if (rollbackFunction) rollbackFunction()
        console.log(error, _newPost)
      },
    }
  )
}
