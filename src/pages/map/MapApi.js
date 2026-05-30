import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export const getMapList = async () => {
	const response = await api.get("/api/maps");
	return response.data;
};

export const getMapDetail = async (placesId) => {
	const response = await api.get(`/api/maps/${placesId}`);
	return response.data;
};

export const getMapPhotoBlob = async (photoName, maxHeight = 400) => {
	if (!photoName) {
		return null;
	}

	const response = await api.get("/api/maps/photo", {
		params: {
			photoName,
			maxHeight,
		},
		responseType: "blob",
	});

	return response.data;
};

export default api;