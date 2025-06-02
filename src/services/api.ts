interface User {
  id: number
  username: string
  role?: string
}

interface Post {
  id: number
  title: string
  url?: string
  imageUrl?: string
  body?: string
  author: string
  createdAt: string
  votes: number
  commentCount?: number
  userVote?: 'up' | 'down' | null
}

interface Comment {
  id: number
  author: string
  body: string
  replyToId?: number
  createdAt: string
  votes: number
  userVote?: 'up' | 'down' | null
}

interface AuthResponse {
  message: string
  user: User
  token: string
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
}

interface PostDetailResponse {
  post: Post
  comments: Comment[]
}

interface VoteResponse {
  message: string
  votes: number
  userVote: 'up' | 'down' | null
}

interface VoteStatusResponse {
  votes: Record<string, 'up' | 'down' | null>
}

class ApiService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Auth methods
  async register(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async verifyToken(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/verify')
  }

  // Posts methods
  async getPosts(page = 1, limit = 20): Promise<PostsResponse> {
    return this.request<PostsResponse>(`/posts?page=${page}&limit=${limit}`)
  }

  async getPost(id: number): Promise<PostDetailResponse> {
    return this.request<PostDetailResponse>(`/posts/${id}`)
  }

  async createPost(postData: {
    title: string
    url?: string
    imageUrl?: string
    body?: string
  }): Promise<{ message: string; post: Post }> {
    return this.request(`/posts`, {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  // Comments methods
  async createComment(commentData: {
    postId: number
    body: string
  }): Promise<{ message: string; comment: Comment }> {
    return this.request(`/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  }

  // Voting methods
  async vote(
    itemId: number,
    itemType: 'post' | 'comment',
    voteType: 'up' | 'down'
  ): Promise<VoteResponse> {
    return this.request(`/votes`, {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType, voteType }),
    })
  }

  async getVoteStatus(items: Array<{ id: number; type: 'post' | 'comment' }>): Promise<VoteStatusResponse> {
    return this.request(`/votes/status`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  }

  // Reports methods
  async reportContent(
    itemId: number,
    itemType: 'post' | 'comment',
    reason?: string
  ): Promise<{ message: string }> {
    return this.request(`/reports`, {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType, reason }),
    })
  }
}

// Moderation API Service
class ModApiService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/mod`

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Mod API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Stats
  async getStats(): Promise<{
    totalPosts: number
    totalComments: number
    reportedPosts: number
    reportedComments: number
    totalUsers: number
    bannedUsers: number
  }> {
    return this.request('/stats')
  }

  // Posts
  async getPosts(params: {
    page?: number
    limit?: number
    search?: string
    author?: string
    sortBy?: string
    status?: string
  } = {}): Promise<{
    posts: any[]
    pagination: { page: number; limit: number; hasMore: boolean }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
    return this.request(`/posts?${searchParams}`)
  }

  async deletePost(id: number): Promise<{ message: string }> {
    return this.request(`/posts/${id}`, { method: 'DELETE' })
  }

  async bulkDeletePosts(postIds: number[]): Promise<{ message: string; deletedCount: number }> {
    return this.request('/posts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ postIds })
    })
  }

  // Comments
  async getComments(params: {
    page?: number
    limit?: number
    search?: string
    author?: string
    sortBy?: string
    status?: string
  } = {}): Promise<{
    comments: any[]
    pagination: { page: number; limit: number; hasMore: boolean }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
    return this.request(`/comments?${searchParams}`)
  }

  async deleteComment(id: number): Promise<{ message: string }> {
    return this.request(`/comments/${id}`, { method: 'DELETE' })
  }

  async bulkDeleteComments(commentIds: number[]): Promise<{ message: string; deletedCount: number }> {
    return this.request('/comments/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ commentIds })
    })
  }

  // Users
  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
  } = {}): Promise<{
    users: any[]
    pagination: { page: number; limit: number; hasMore: boolean }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
    return this.request(`/users?${searchParams}`)
  }

  async getUserProfile(username: string): Promise<any> {
    return this.request(`/users/${username}`)
  }

  async banUser(username: string): Promise<{ message: string }> {
    return this.request(`/users/${username}/ban`, { method: 'POST' })
  }

  async unbanUser(username: string): Promise<{ message: string }> {
    return this.request(`/users/${username}/unban`, { method: 'POST' })
  }

  async deleteAllUserContent(username: string): Promise<{ 
    message: string
    deletedPosts: number
    deletedComments: number 
  }> {
    return this.request(`/users/${username}/content`, { method: 'DELETE' })
  }

  // Reports
  async getReports(params: {
    page?: number
    limit?: number
    status?: string
  } = {}): Promise<{
    reports: any[]
    pagination: { page: number; limit: number; hasMore: boolean }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
    return this.request(`/reports?${searchParams}`)
  }

  async dismissReport(id: number): Promise<{ message: string }> {
    return this.request(`/reports/${id}/dismiss`, { method: 'POST' })
  }
}

export const apiService = new ApiService()
export const modApiService = new ModApiService()
export type { User, Post, Comment, AuthResponse, PostsResponse, PostDetailResponse }
