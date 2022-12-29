import React from 'react'
import axios from 'axios'
import { queryCache, useMutation } from 'react-query'

export default function useSavePost() {
  return useMutation(
    (values) =>
      axios.patch(`/api/posts/${values.id}`, values).then((res) => res.data),
    {
      onMutate: (newPost) => {
        queryCache.setQueryData(['posts', newPost.id], newPost)
      },
      onSuccess: (data) => {
        // queryCache.invalidateQueries('posts') this is 2 round update
        queryCache.setQueryData(['posts', data.id], data)
        // queryCache.invalidateQueries('posts') // using this is the naive way
        // of using optimistic updaates
        // here is the cooler version of it

        queryCache.setQueryData('posts', (old = []) => {
          if (old) return old
          else
            return old.map((d) => {
              if (d.id === data.id) return data
              else return d
            })
        })
        queryCache.invalidateQueries('posts')
        // console.log(data)
      },
    }
  )
}
