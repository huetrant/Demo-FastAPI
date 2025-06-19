import { useState, useEffect, useCallback } from 'react'
import { AxiosResponse } from 'axios'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  deps?: any[]
}

export function useApi<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError, deps = [] } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      const data = response.data
      setState({ data, loading: false, error: null })
      onSuccess?.(data)
      return data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
      setState({ data: null, loading: false, error: errorMessage })
      onError?.(error)
      throw error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    ...state,
    execute,
  }
}

// Hook for mutations (create, update, delete)
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<AxiosResponse<T>>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await mutationFn(params)
      const data = response.data
      setState({ data, loading: false, error: null })
      onSuccess?.(data)
      return data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      onError?.(error)
      throw error
    }
  }, [mutationFn, onSuccess, onError])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}

// Hook for paginated data
interface UsePaginatedApiState<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
}

interface PaginatedResponse<T> {
  data: T[]
  count: number
  total?: number
}

export function usePaginatedApi<T>(
  apiCall: (page: number, pageSize: number) => Promise<AxiosResponse<PaginatedResponse<T>>>,
  initialPage = 1,
  initialPageSize = 10
) {
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: [],
    total: 0,
    page: initialPage,
    pageSize: initialPageSize,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(async (page: number, pageSize: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall(page, pageSize)
      const { data, count, total } = response.data

      setState({
        data: data || [],
        total: total || count || 0,
        page,
        pageSize,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [apiCall])

  const changePage = useCallback((newPage: number, newPageSize?: number) => {
    const size = newPageSize || state.pageSize
    fetchData(newPage, size)
  }, [fetchData, state.pageSize])

  const refresh = useCallback(() => {
    fetchData(state.page, state.pageSize)
  }, [fetchData, state.page, state.pageSize])

  useEffect(() => {
    fetchData(initialPage, initialPageSize)
  }, [fetchData, initialPage, initialPageSize])

  return {
    ...state,
    changePage,
    refresh,
    fetchData,
  }
}
