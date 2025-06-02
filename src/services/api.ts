interface User {
  id: number
  username: string
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
  private baseUrl = import.meta.env.PROD ? 
	import.meta.env.VITE_API_BASE_URL : 
	'/api'  // Use proxy in development
  
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
}

export const apiService = new ApiService()
export type { User, Post, Comment, AuthResponse, PostsResponse, PostDetailResponse }
