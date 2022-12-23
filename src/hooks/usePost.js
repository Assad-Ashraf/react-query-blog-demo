import axios from 'axios'
import { useQuery } from 'react-query'

export const fetchPost = (postId) =>
  axios.get(`/api/posts/${postId}`).then((res) => res.data)

export default function usePost(postId) {
  return useQuery(['post', postId], () => fetchPost(postId))
}
