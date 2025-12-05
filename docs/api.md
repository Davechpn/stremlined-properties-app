# API & Types Overview

This file explains where to find API clients and TypeScript types and shows a small usage example.

Where to look

- API clients and wrappers: `services/api/` — contains the code that sends HTTP requests, sets headers, and handles auth tokens.
- Auth and storage helpers: `services/auth/` and `services/storage/`.
- Type definitions: `types/` (e.g., `auth.ts`, `invitation.ts`, `organization.ts`, `profile.ts`).

Common concepts

- Use the exported API client from `services/api` to issue requests. The client may be built with `apisauce` or `axios`.
- Use React Query (`@tanstack/react-query`) to wrap API calls and cache results.

Example: Fetch current user (pseudo-code)

```ts
import { useQuery } from '@tanstack/react-query'
import api from '~/services/api'
import { User } from '~/types/profile'

function useCurrentUser() {
  return useQuery<User | null>(['currentUser'], async () => {
    const res = await api.get('/me')
    return res.data
  })
}
```

Types

- `types/auth.ts` — authentication-related types (tokens, credentials)
- `types/invitation.ts` — invitation payloads and responses
- `types/organization.ts` — organization model
- `types/profile.ts` — user profile model

Adding new endpoints

1. Add a function in `services/api/` (or a new service module) that performs the HTTP request.
2. Add or extend TypeScript types in `types/` for request/response shapes.
3. Add a `useQuery` or `useMutation` hook (in `hooks/` or alongside the service) to expose the API call to components.

Security notes

- Do not commit secrets. Use secure storage for tokens (e.g., `expo-secure-store`).
- Ensure authenticated endpoints include proper auth headers (the API client should centralize this).
