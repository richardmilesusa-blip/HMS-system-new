import { GoogleGenAI } from "@google/genai";
import { Patient } from "../types";

const API_KEY = process.env.API_KEY || ''; // Env variable injected by runtime

export class ClinicalAIService {
  private client: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.client = new GoogleGenAI({ apiKey: API_KEY });
  }

  async analyzePatient(patient: Patient, query: string): Promise<string> {
    if (!API_KEY) return "Error: API Key is missing.";

    const context = `
      You are an expert Clinical Decision Support AI named "Nexus AI".
      You are assisting a doctor in a hospital setting.
      
      Patient Context:
      ID: ${patient.id}
      Name: ${patient.firstName} ${patient.lastName}
      Age/DOB: ${patient.dob}
      Gender: ${patient.gender}
      Status: ${patient.status}
      Known Diagnosis: ${patient.diagnosis.join(', ')}
      Allergies: ${patient.allergies.join(', ')}
      Recent Vitals: ${JSON.stringify(patient.vitalsHistory.slice(0, 3))}
      Recent Lab Results: ${JSON.stringify(patient.labResults)}

      User Query: "${query}"

      Instructions:
      1. Provide a concise, clinical analysis based on the provided data.
      2. If values are abnormal (e.g. high BP, low SpO2), flag them.
      3. Suggest potential differentials or next steps if asked.
      4. Always maintain a professional, medical tone.
      5. Add a disclaimer that you are an AI assistant and this is not a final diagnosis.
    `;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelId,
        contents: context,
        config: {
            temperature: 0.2, // Low temperature for more deterministic/factual medical responses
            systemInstruction: "You are a helpful, professional medical AI assistant."
        }
      });
      return response.text || "No analysis generated.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Unable to process request at this time. Please check system logs.";
    }
  }

  async generalConsult(query: string): Promise<string> {
    if (!API_KEY) return "Error: API Key is missing.";

    try {
        const response = await this.client.models.generateContent({
            model: this.modelId,
            contents: query,
            config: {
                systemInstruction: "You are an expert hospital administrator and medical consultant."
            }
        });
        return response.text || "No response.";
    } catch (error) {
        console.error("AI Service Error:", error);
        return "Service unavailable.";
    }
  }
}

export const aiService = new ClinicalAIService();
