import { useState, useCallback, useEffect } from 'react'
import { PaginatedResponse } from '../client/types'
import { AxiosResponse } from 'axios'

interface PaginatedApiResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
  changePage: (page: number, size?: number) => void
  refresh: () => void
}

type Fetcher<T> = (
  page: number,
  pageSize: number
) => Promise<AxiosResponse<PaginatedResponse<T>>>

export const usePaginatedApi = <T>(
  fetcher: Fetcher<T>,
  initialPage = 1,
  initialPageSize = 10
): PaginatedApiResult<T> => {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetcher(page, pageSize)
      setData(response.data.data)
      setTotal(response.data.count)
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, fetcher])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const changePage = (newPage: number, newSize?: number) => {
    setPage(newPage)
    if (newSize) {
      setPageSize(newSize)
    }
  }

  const refresh = () => {
    fetchData()
  }

  return { data, total, page, pageSize, loading, error, changePage, refresh }
}