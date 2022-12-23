````bash
import React from 'react'
import axios from 'axios'
import { useQuery } from 'react-query'
export default function usePosts() {
  // const [state, setState] = React.useReducer((_, action) => action, {
  //   isLoading: true,
  // })


  const fetch = async () => {
    setState({ isLoading: true })
    try {
      const data = await axios.get('/api/posts').then((res) => res.data)
      setState({ isSuccess: true, data })
    } catch (error) {
      setState({ isError: true, error })
    }
  }

  React.useEffect(() => {
    fetch()
  }, [])

  return {
    ...state,
    fetch,
  }
}```
````

Here first we are gonna be looking into the fetch function for posts

### State Business

All of the state business that are being used in react function that are used when there is data and when there is not and remmebber we had used something like this too. And call a check onto the jsx iff there is data do this!
we dnt need the reducer hook (or in naive form, we dnt need the useState hook stuff), because rQ will handle the state management cycle for us, and pops the underlying things with either data or error.

### Fetch function?

We have it passed to the 2nd argument of rQ already. So no need of it.

### Effect?

React query handles all the lifecycle around the fetching we dnt need the effect too.

### End Result

```bash
import React from 'react'
import axios from 'axios'
import { useQuery } from 'react-query'
export default function usePosts() {

  return useQuery(
    'posts',
    async () => await axios.get('/api/posts').then((res) => res.data)
  )
```
