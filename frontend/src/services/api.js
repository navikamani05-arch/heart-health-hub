const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'}/api`;
export const api = {
  // Auth
  register: async (username, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  // Translations
  getTranslations: async () => {
    const res = await fetch(`${API_BASE_URL}/translations`);
    if (!res.ok) throw new Error('Failed to load translations');
    return res.json();
  },

  // Prediction
  predict: async (patientData, userId = null) => {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...patientData, user_id: userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Prediction failed');
    return data;
  },

  // Routine Generation
  generateRoutine: async (patientInputs, riskScore, topShapFeatures, lang = 'en') => {
    const res = await fetch(`${API_BASE_URL}/routine/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_inputs: patientInputs,
        risk_score: riskScore,
        top_shap_features: topShapFeatures,
        lang,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to generate routine');
    return data;
  },

  // History
  getHistory: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/history/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  // Health Goals
  getGoals: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/goals/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  addGoal: async (userId, goalText) => {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, goal: goalText }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to add goal');
    return data;
  },

  achieveGoal: async (goalId) => {
    const res = await fetch(`${API_BASE_URL}/goals/${goalId}/achieve`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  // Analytics Endpoints
  getModelMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/model-metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  getShapImportance: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/shap-importance`);
    if (!res.ok) throw new Error('Failed to fetch SHAP importance');
    return res.json();
  },

  // Hospital Search
  searchCardiacHospitals: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.state) queryParams.append('state', params.state);
    if (params.district) queryParams.append('district', params.district);
    if (params.pincode) queryParams.append('pincode', params.pincode);
    if (params.specialty) queryParams.append('specialty', params.specialty);
    if (params.emergency_only) queryParams.append('emergency_only', params.emergency_only);
    if (params.lat) queryParams.append('lat', params.lat);
    if (params.lng) queryParams.append('lng', params.lng);

    const res = await fetch(`${API_BASE_URL}/cardiac-care/search?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Hospital search failed');
    return res.json();
  },

  // PDF Download URL helper
  getPdfUrl: (predictionId, lang = 'en') => {
    return `${API_BASE_URL}/reports/pdf/${predictionId}?lang=${lang}`;
  },

  // Global SHAP image URL
  getGlobalShapUrl: () => `${API_BASE_URL}/explainability/global`,

  // AI Wellness Coach chat
  coachChat: async (message, patientContext = {}) => {
    const res = await fetch(`${API_BASE_URL}/wellness-coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, patient_context: patientContext }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Coach chat failed');
    return data; // { reply: "..." }
  },
};
