import api from "@/lib/axios";

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const verifyLoginOtp = async (data: {
  email: string;
  otp: string;
}) => {
  const response = await api.post("/auth/verify-login-otp", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};