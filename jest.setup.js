// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_MAPS_API_KEY = 'test-api-key'

// Mock Google Maps
global.google = {
  maps: {
    LatLng: jest.fn(),
    Polygon: jest.fn(),
    geometry: {
      poly: {
        containsLocation: jest.fn(),
      },
    },
  },
} 