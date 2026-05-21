import React, { createContext, useContext, useState, useEffect } from "react";
import { saveToken, getToken, removeToken } from "../utils/storage";

const AuthContext = createContext();

const decodeToken = (token) => {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = JSON.parse(atob(parts[1]));
		return payload;
	} catch (e) {
		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(getToken());
	const [user, setUser] = useState(() => decodeToken(getToken()));

	useEffect(() => {
		setUser(token ? decodeToken(token) : null);
	}, [token]);

	const login = (tokenValue) => {
		saveToken(tokenValue);
		setToken(tokenValue);
	};

	const logout = () => {
		removeToken();
		setToken(null);
		setUser(null);
	};

	const isAuthenticated = !!token;

	return (
		<AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
