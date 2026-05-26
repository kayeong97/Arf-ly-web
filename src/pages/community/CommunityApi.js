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

export const getPostList = async ({ sort = "latest", cursor, size = 20 }) => {
	const params = {
		sort,
		size,
	};

	if (cursor) {
		params.cursor = cursor;
	}

	const response = await api.get("/api/posts", {
		params,
	});

	return response.data;
};

export const createPost = async ({ title, content, files }) => {
	const formData = new FormData();

	formData.append(
		"request",
		new Blob(
			[
				JSON.stringify({
					title,
					content,
				}),
			],
			{
				type: "application/json",
			}
		)
	);

	files.forEach((file) => {
		formData.append("files", file);
	});

	const response = await api.post("/api/posts", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
};

export default api;