/**
 * PackWise AI - Recommendation API Client Module.
 * Connects the React frontend to the FastAPI recommendation engine endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Normalizes user form inputs to match backend RecommendationRequest schema.
 * Supports simple mode and advanced mode.
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

    if (formData.moisture_category || formData.moistureCategory) {
      payload.moisture_category = formData.moisture_category || formData.moistureCategory;
    }
    if (formData.ph_category || formData.phCategory) {
      payload.ph_category = formData.ph_category || formData.phCategory;
    }
    if (formData.oil_fat_category || formData.oilFatCategory) {
      payload.oil_fat_category = formData.oil_fat_category || formData.oilFatCategory;
    }
    if (formData.respiration_category || formData.respirationCategory) {
      payload.respiration_category = formData.respiration_category || formData.respirationCategory;
    }
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

  // 2. ADVANCED MODE PAYLOAD (Detailed numeric & categorical fields)
  const category = formData.commodity_category || formData.category || 'Other / Custom';
  
  // Moisture
  const moistureCategory = formData.moisture_category || formData.moistureCategory;
  const isExactMoisture = moistureCategory === 'exact' || (moistureCategory === undefined && (formData.moisture_percent !== undefined || formData.moisture !== undefined));
  const moistureNum = parseFloat(formData.moisture_percent ?? formData.moisture);

  // pH
  const phCategory = formData.ph_category || formData.phCategory;
  const isExactPh = phCategory === 'exact' || (phCategory === undefined && (formData.ph !== undefined || formData.pH !== undefined));
  const phNum = parseFloat(formData.ph ?? formData.pH);

  // Oil / Fat
  const oilFatCategory = formData.oil_fat_category || formData.oilFatCategory;
  const isExactOilFat = oilFatCategory === 'exact' || (oilFatCategory === undefined && (formData.oil_fat_level !== undefined || formData.oilFatLevel !== undefined));
  let oilFat = (formData.oil_fat_level || formData.oilFatLevel || 'low').toLowerCase();
  if (oilFat === 'none') oilFat = 'low';
  else if (oilFat === 'moderate') oilFat = 'medium';

  // Respiration
  const respirationCategory = formData.respiration_category || formData.respirationCategory;
  const isExactRespiration = respirationCategory === 'exact' || (respirationCategory === undefined && (formData.respiration_rate !== undefined || formData.respirationRate !== undefined));
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

  const payload = {
    simple_mode: false,
    use_defaults: useDefaults,
    commodity_name: commodityName,
    commodity_category: category,
    storage_type: storageType,
    desired_shelf_life_days: isNaN(shelfLife) ? null : shelfLife,
    storage_temperature: isNaN(storageTemp) ? null : storageTemp,
    relative_humidity: isNaN(relativeHumidity) ? null : relativeHumidity,
    transportation_condition: transportCondition,
    transportation_duration_days: isNaN(transportDays) ? null : transportDays,
    sustainability_preference: sustainabilityPreference,
    packaging_format_preference: packagingFormat,
  };

  // Assign Moisture
  if (isExactMoisture && !isNaN(moistureNum)) {
    payload.moisture_percent = moistureNum;
  } else if (moistureCategory && moistureCategory !== 'exact') {
    payload.moisture_category = moistureCategory;
  } else if (!isNaN(moistureNum)) {
    payload.moisture_percent = moistureNum;
  }

  // Assign pH
  if (isExactPh && !isNaN(phNum)) {
    payload.ph = phNum;
  } else if (phCategory && phCategory !== 'exact') {
    payload.ph_category = phCategory;
  } else if (!isNaN(phNum)) {
    payload.ph = phNum;
  }

  // Assign Oil / Fat
  if (isExactOilFat && oilFat) {
    payload.oil_fat_level = oilFat;
  } else if (oilFatCategory && oilFatCategory !== 'exact') {
    payload.oil_fat_category = oilFatCategory;
  } else if (oilFat) {
    payload.oil_fat_level = oilFat;
  }

  // Assign Respiration
  if (isExactRespiration && respiration) {
    payload.respiration_rate = respiration;
  } else if (respirationCategory && respirationCategory !== 'exact') {
    payload.respiration_category = respirationCategory;
  } else if (respiration) {
    payload.respiration_rate = respiration;
  }

  return payload;
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
        `Backend server unavailable (${API_BASE_URL}). Please verify that FastAPI backend is running.`
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
 * Fetches all available packaging materials from backend.
 * @returns {Promise<Array>}
 */
export async function fetchMaterials() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials`, {
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
 * Fetches admin dashboard overview summary from backend.
 * @returns {Promise<Object|null>}
 */
export async function fetchAdminSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-summary`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
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
