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