/**
 * PackWise AI - Recommendation API Client Module.
 * Connects the React frontend to the FastAPI recommendation engine endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Normalizes user form inputs to match backend RecommendationRequest schema.
 * @param {Object} formData
 * @returns {Object}
 */
export function normalizeRecommendationPayload(formData) {
  const commodityName = formData.commodity_name || formData.commodityName || '';
  const category = formData.commodity_category || formData.category || 'Other / Custom';
  const moisture = parseFloat(formData.moisture_percent ?? formData.moisture ?? 15.0);
  
  let oilFat = (formData.oil_fat_level || formData.oilFatLevel || 'low').toLowerCase();
  if (oilFat === 'none') oilFat = 'low';
  else if (oilFat === 'moderate') oilFat = 'medium';

  const ph = parseFloat(formData.ph ?? formData.pH ?? 6.0);

  let respiration = (formData.respiration_rate || formData.respirationRate || 'very_low').toLowerCase();
  if (respiration === 'none' || respiration === 'zero') respiration = 'very_low';
  else if (respiration === 'moderate') respiration = 'medium';

  const shelfLife = parseInt(formData.desired_shelf_life_days ?? formData.shelfLifeDays ?? 30, 10);
  const storageType = (formData.storage_type || formData.storageType || 'ambient').toLowerCase();
  const storageTemp = parseFloat(formData.storage_temperature ?? formData.storageTemp ?? 20.0);
  const relativeHumidity = parseFloat(formData.relative_humidity ?? formData.relativeHumidity ?? 55.0);
  const transportCondition = formData.transportation_condition || formData.transportCondition || 'local';
  const transportDays = parseInt(formData.transportation_duration_days ?? formData.transportDays ?? 2, 10);
  const sustainabilityPreference = (formData.sustainability_preference || formData.sustainabilityPreference || 'medium').toLowerCase();
  const packagingFormat = formData.packaging_format_preference || formData.packagingFormat || 'pouch';

  return {
    commodity_name: commodityName.trim(),
    commodity_category: category,
    moisture_percent: isNaN(moisture) ? 15.0 : moisture,
    oil_fat_level: oilFat,
    ph: isNaN(ph) ? 6.0 : ph,
    respiration_rate: respiration,
    desired_shelf_life_days: isNaN(shelfLife) ? 30 : shelfLife,
    storage_type: storageType,
    storage_temperature: isNaN(storageTemp) ? 20.0 : storageTemp,
    relative_humidity: isNaN(relativeHumidity) ? 55.0 : relativeHumidity,
    transportation_condition: transportCondition,
    transportation_duration_days: isNaN(transportDays) ? 2 : transportDays,
    sustainability_preference: sustainabilityPreference,
    packaging_format_preference: packagingFormat,
  };
}

/**
 * Submits food characteristics and storage conditions to the recommendation engine.
 * @param {Object} formData
 * @returns {Promise<Object>} API Recommendation response object
 */
export async function generateRecommendation(formData) {
  const payload = normalizeRecommendationPayload(formData);

  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Detect network / offline / backend down issues
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Backend unavailable. Unable to connect to ${API_BASE_URL}. Please ensure the FastAPI backend is running.`
      );
    }
    throw error;
  }
}

/**
 * Optional health check helper to verify backend connectivity.
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
