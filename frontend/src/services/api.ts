const API_BASE_PATH = "http://localhost:3001/api/";

export async function getFilteredReportCases(data: any) {
  return postData("data", data);
}

export async function getCountries() {
  return getData("countries");
}

export async function getMetrics() {
  return getData("metrics");
}

export async function getAvailableDiseases() {
  return getData("diseases");
}

// Interface pour les prédictions
export interface PredictionData {
  inhabitantsNumber: number;
  vaccinationRate: number;
  diseaseId: number;
  localizationId: number;
  day_of_week: number;
  month: number;
}

export interface PredictionResult {
  day: number;
  predicted_totalConfirmed: number;
}

// Fonction pour calculer les prédictions localement
export function getPredictions(data: PredictionData): PredictionResult[] {
  // Données de test fixes pour vérifier l'affichage
  return [
    { day: 1, predicted_totalConfirmed: 1100000 },
    { day: 2, predicted_totalConfirmed: 1200000 },
    { day: 3, predicted_totalConfirmed: 1300000 },
    { day: 4, predicted_totalConfirmed: 1400000 },
    { day: 5, predicted_totalConfirmed: 1500000 }
  ];
}

async function getData(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE_PATH}${endpoint}`);
  if (!response.ok) throw new Error(`GET error : ${response.statusText}`);
  return response.json();
}

async function postData(endpoint: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_PATH}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`POST error : ${response.statusText}`);
  return response.json();
} 