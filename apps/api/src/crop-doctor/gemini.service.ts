import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface RecommendedProduct {
  name: string
  purpose: string
  approxCostGhs?: number
}

export interface Diagnosis {
  healthy: boolean
  issue: string
  issueType: 'disease' | 'pest' | 'nutrient_deficiency' | 'healthy' | 'unknown'
  severity: 'none' | 'mild' | 'moderate' | 'severe'
  urgency?: 'low' | 'medium' | 'high'
  confidencePct: number
  summary: string
  immediateActions?: string[]
  treatment: string[]
  prevention: string[]
  products?: RecommendedProduct[]
  estimatedCostGhs: number
}

const PROMPT = `You are an expert agricultural plant pathologist working in Ghana, West Africa.
Analyze this photo of a crop/plant and diagnose any disease, pest infestation, or nutrient deficiency.

Respond ONLY with a JSON object in exactly this shape:
{
  "healthy": boolean,
  "issue": "name of the disease/pest/deficiency, or 'Healthy plant'",
  "issueType": "disease" | "pest" | "nutrient_deficiency" | "healthy" | "unknown",
  "severity": "none" | "mild" | "moderate" | "severe",
  "urgency": "low" | "medium" | "high" (how quickly the farmer must act; "low" when healthy),
  "confidencePct": number (0-100),
  "summary": "2-3 sentence plain-language explanation a farmer can understand",
  "immediateActions": ["what to do TODAY to stop it spreading", ...] (empty array if healthy),
  "treatment": ["step 1", "step 2", ...] (practical steps, products available in Ghana),
  "prevention": ["tip 1", "tip 2", ...],
  "products": [{ "name": "specific input/product to buy at a Ghanaian agrovet shop", "purpose": "what it does", "approxCostGhs": number }],
  "estimatedCostGhs": number (estimated total treatment cost in Ghanaian cedis)
}

Recommend only real products a farmer can buy at a local agrovet shop in Ghana. Use simple words.
If the plant is healthy, set urgency to "low" and leave immediateActions, treatment and products as empty arrays.
If the image is not a plant/crop, set issueType to "unknown" and explain in summary.`

@Injectable()
export class GeminiService {
  constructor(private readonly config: ConfigService) {}

  async diagnoseCrop(imageBase64: string, mimeType: string): Promise<Diagnosis> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI Crop Doctor is not configured yet (missing Gemini API key)'
      )
    }

    const model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
                { text: PROMPT },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        },
        { timeout: 60000 }
      )

      const text: string | undefined =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('Empty response from Gemini')
      }

      return JSON.parse(text) as Diagnosis
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response
          ? `${error.response.status}: ${JSON.stringify(error.response.data?.error?.message ?? '')}`
          : error instanceof Error
            ? error.message
            : 'unknown error'
      throw new ServiceUnavailableException(`AI diagnosis failed (${detail}). Please try again.`)
    }
  }
}
