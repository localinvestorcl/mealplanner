const PEXELS_API_KEY = process.env.PEXELS_API_KEY!
const BASE_URL = 'https://api.pexels.com/v1'

interface PexelsPhoto {
  id: number
  src: { medium: string; large: string }
  alt: string
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
  total_results: number
}

export async function searchFoodPhoto(query: string): Promise<string | null> {
  // Try specific meal name first, then cuisine fallback
  const queries = [query, `${query} food`, 'dinner food meal']

  for (const q of queries) {
    try {
      const res = await fetch(
        `${BASE_URL}/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      )
      if (!res.ok) continue
      const data = await res.json() as PexelsSearchResponse
      if (data.photos.length > 0) {
        return data.photos[0].src.medium
      }
    } catch {
      continue
    }
  }

  return null
}
