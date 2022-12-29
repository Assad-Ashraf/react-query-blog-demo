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

can be refactored to:

```bash
() =>  axios.get('/api/posts').then((res) => res.data)
```

Because promises are sugar layer over the thing, we can ommit async, await thing here. One more thing before we will go ahead is this:
New version of rQ has a good syntax for our unique keys like

```bash
return useQuery(['posts', postID], ()=> fetch.get('url));

```

Structured keys has many benifits

- Easy to remember in devtools
- When we will look into invalidate thing we will see it will invalidate all the queries with 'posts' prefix

Now let' convert the post hook into reactQ hook...

```bash

export default function usePost(postId) {
  return useQuery(['post', postId], () => fetchPost(postId))
}

```

### Using Devtools

Stale vs fresh

- Some of them are in grey color because we are not subscribed with them on the page this means that they are in the cache but not used yet
- the ones that we have currently subscribed with are in yellow which means that they are staled

React query is very aggresive and it continuously fetches the data in baclground, it uses your interation with the window to see when the data should be updated!
Window.focus is the thing and say ok, you have comeback and will refetch the data that is stale, and it does all of this without flashing

### Refecthing the Queries

```bash
const postQuery = usePosts() // calling the hoook itself
postQuery.refetch()

```

### Mutation

- they are for update events
- onSettled, onSuccess, onError, onMutate

- Optimistic Updates
- Making the

Here is the versions of this concept of updates

```bash

export default function useSavePost() {
  return useMutation(
    (values) =>
      axios.patch(`/api/posts/${values.id}`, values).then((res) => res.data),
    {
      onSuccess: (data) => {
        // queryCache.invalidateQueries('posts') this is 2 round update
        queryCache.setQueryData(['posts', data.id], data)
        console.log(data)
      },
    }
  )
}
```

But if we willl visit the other linls then we will see that the post is not updated there, so what we can do is to invalidate the queries in cache or we can use the 2nd argument of setQuery function which is just an updater event over what is comes back in the success of the promise sent back by fetch api

```bash

  onSuccess: (data) => {
        // queryCache.invalidateQueries('posts') this is 2 round update
        queryCache.setQueryData(['posts', data.id], data)
        // queryCache.invalidateQueries('posts') // using this is the naive way
        // of using optimistic updaates
        // here is the cooler version of it

        queryCache.setQueryData('posts', (old) => {
          return old.map((d) => {
            if (d.id === data.id) return data
            else return d
          })
        })
        // console.log(data)
      },
```

This is less work on band width and is not actually optimistic updares but is short circuting the things

- Optimistic updates is when you are taking actions on the user interface before you actually know that it is persisted to the disc

```bash
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
```

Above is what we call optimistic updates thing

- invalidateQueries will mark the queries as stale wich means they are to be re-fectched once they are

### Create post hook with OP Updates

```bash
import React from 'react'
import axios from 'axios'
import { queryCache, useMutation } from 'react-query'

export default function useCreatePost() {
  return useMutation(
    (values) => axios.post('/api/posts', values).then((res) => res.data),
    {
      onMutate: (newPost) => {
        queryCache.setQueryData('posts', (old) => [...old, newPost])
      },
      onSuccess: () => {
        queryCache.invalidateQueries('posts')
      },
    }
  )
}

```

## Errors

But what if there is an error occured in our API, but we have already optimistically updated the dta.

- we will make a snapshot of the data from queryCache
- Now rQ got you here to pass it into the errors or succes, whatever you will return in the onMutate, its going to be poped up into the onError (error, newPost, rollbackValue)
- Always unvalidate the query when there is error
- once something is in onSuccess as well as into onError then we can call it into the onSettled

- Encapsulation the logic into onMutation is also a think we will do!
- The Optimistic update mentioned above is actually the example of short circuiting but here the OP update really shines with correct use of Errors

```bash

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
```

### Refeching a Query (shines for the things like messaging app etc)

```bash
third arg goes as
{
refetchInterval: 1000
}
```
