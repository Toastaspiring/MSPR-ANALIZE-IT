import { get } from "axios";

const API_BASE_PATH = "http://localhost:3000/"

// Get all filtered report cases from api
export async function getFilteredReportCases(data: any) {
    return postData("case/filtered", data)
        .then(data => console.log("Data received :", data))
        .catch(error => console.error("Error :", error));
}

// ----------------------------------------------------------------------------------------------

async function getData(endpoint: string): Promise<any> {
    console.log("GET request to:", `${API_BASE_PATH}${endpoint}`);
    const response = await fetch(`${API_BASE_PATH}${endpoint}`);
    if (!response.ok) {
        throw new Error(`GET error : ${response.statusText}`);
    }
    return response.json();
}

async function postData(endpoint: string, data: any): Promise<any> {
    console.log("POST request to:", `${API_BASE_PATH}${endpoint}`);
    const response = await fetch(`${API_BASE_PATH}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`POST error : ${response.statusText}`);
    }
    return response.json();
}