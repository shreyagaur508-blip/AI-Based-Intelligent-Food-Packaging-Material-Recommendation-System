/**
 * PackWise AI - Recommendation API Client Module.
 * Connects the React frontend to the FastAPI recommendation engine endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Normalizes user form inputs to match backend RecommendationRequest schema for simple and advanced modes.
 * @param {Object} formData
 * @returns {Object}
 */
export function normalizeRecommendationPayload(formData) {
  const isSimpleMode = formData.simple_mode !== undefined ? formData.simple_mode : formData.isSimpleMode ?? true;
  const useDefaults = formData.use_defaults !== undefined ? formData.use_defaults : formData.useDefaults ?? true;
  const commodityName = (formData.commodity_name || formData.commodityName || '').trim();

  // 1. SIMPLE MODE PAYLOAD (Minimal fields with default resolution)
  if (isSimpleMode) {
    const payload = {
      simple_mode: true,
      use_defaults: useDefaults,
      commodity_name: commodityName,
      storage_type: (formData.storage_type || formData.storageType || 'ambient').toLowerCase(),
    };

    if (formData.shelf_life_category || formData.shelfLifeCategory) {
      payload.shelf_life_category = formData.shelf_life_category || formData.shelfLifeCategory;
    }
    if (formData.transport_category || formData.transportCategory) {
      payload.transport_category = formData.transport_category || formData.transportCategory;
    }
    if (formData.sustainability_preference || formData.sustainabilityPreference) {
      payload.sustainability_preference = (formData.sustainability_preference || formData.sustainabilityPreference).toLowerCase();
    }
    if (formData.packaging_format_preference || formData.packagingFormat) {
      payload.packaging_format_preference = formData.packaging_format_preference || formData.packagingFormat;
    }

    return payload;
  }

  // 2. ADVANCED MODE PAYLOAD (Full technical lab metrics)
  const category = formData.commodity_category || formData.category || 'Other / Custom';
  const moisture = parseFloat(formData.moisture_percent ?? formData.moisture);
  
  let oilFat = (formData.oil_fat_level || formData.oilFatLevel || 'low').toLowerCase();
  if (oilFat === 'none') oilFat = 'low';
  else if (oilFat === 'moderate') oilFat = 'medium';

  const ph = parseFloat(formData.ph ?? formData.pH);

  let respiration = (formData.respiration_rate || formData.respirationRate || 'very_low').toLowerCase();
  if (respiration === 'none' || respiration === 'zero') respiration = 'very_low';
  else if (respiration === 'moderate') respiration = 'medium';

  const shelfLife = parseInt(formData.desired_shelf_life_days ?? formData.shelfLifeDays, 10);
  const storageType = (formData.storage_type || formData.storageType || 'ambient').toLowerCase();
  const storageTemp = parseFloat(formData.storage_temperature ?? formData.storageTemp);
  const relativeHumidity = parseFloat(formData.relative_humidity ?? formData.relativeHumidity);
  const transportCondition = formData.transportation_condition || formData.transportCondition || 'local';
  const transportDays = parseInt(formData.transportation_duration_days ?? formData.transportDays, 10);
  const sustainabilityPreference = (formData.sustainability_preference || formData.sustainabilityPreference || 'medium').toLowerCase();
  const packagingFormat = formData.packaging_format_preference || formData.packagingFormat || 'pouch';

  return {
    simple_mode: false,
    use_defaults: useDefaults,
    commodity_name: commodityName,
    commodity_category: category,
    moisture_percent: isNaN(moisture) ? null : moisture,
    oil_fat_level: oilFat,
    ph: isNaN(ph) ? null : ph,
    respiration_rate: respiration,
    desired_shelf_life_days: isNaN(shelfLife) ? null : shelfLife,
    storage_type: storageType,
    storage_temperature: isNaN(storageTemp) ? null : storageTemp,
    relative_humidity: isNaN(relativeHumidity) ? null : relativeHumidity,
    transportation_condition: transportCondition,
    transportation_duration_days: isNaN(transportDays) ? null : transportDays,
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
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Backend unavailable. Unable to connect to ${API_BASE_URL}. Please ensure the FastAPI backend is running.`
      );
    }
    throw error;
  }
}

/**
 * Fetches all available commodities from backend.
 * @returns {Promise<Array>}
 */
export async function fetchCommodities() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/commodities`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Health check helper to verify backend connectivity.
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
