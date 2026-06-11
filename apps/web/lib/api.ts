const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface User {
  id: string
  email: string
  role: 'FARMER' | 'RETAILER' | 'INVESTOR' | 'SUPPLIER' | 'ADMIN'
  fullName: string | null
  kycStatus: string
  trustScore: number
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResult {
  user: User
  token: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('farmlink_token') : null

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message || `Request failed (${res.status})`
    throw new ApiError(res.status, message)
  }

  return body as T
}

export const api = {
  register(data: {
    email: string
    password: string
    fullName: string
    role: string
  }): Promise<AuthResult> {
    return request<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login(data: { email: string; password: string }): Promise<AuthResult> {
    return request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  me(): Promise<User> {
    return request<User>('/auth/me')
  },

  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },

  post<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data) })
  },

  patch<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(data) })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
