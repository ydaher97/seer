import { renderHook, act } from '@testing-library/react'
import { useUserLocation } from '../useUserLocation'

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

describe('useUserLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null initially', () => {
    const { result } = renderHook(() => useUserLocation())
    expect(result.current).toBeNull()
  })

  it('should handle successful location retrieval', async () => {
    const mockPosition = {
      coords: {
        latitude: 32.794,
        longitude: 35.5312,
      },
    }

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    const { result } = renderHook(() => useUserLocation())

    await act(async () => {
      // Wait for the geolocation to be processed
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current).toEqual({
      lat: mockPosition.coords.latitude,
      lng: mockPosition.coords.longitude,
    })
  })

  it('should handle geolocation error', async () => {
    const mockError = {
      code: 1,
      message: 'User denied Geolocation',
    }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const { result } = renderHook(() => useUserLocation())

    await act(async () => {
      // Wait for the geolocation to be processed
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current).toBeNull()
  })

  it('should handle unsupported geolocation', () => {
    // Remove geolocation from navigator
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    })

    const { result } = renderHook(() => useUserLocation())
    expect(result.current).toBeNull()
  })
}) 