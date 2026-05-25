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
	const [isValidating, setIsValidating] = useState(true);
	const [validationError, setValidationError] = useState(null);

	// ✅ SECURITY: Validate token with backend on app load
	useEffect(() => {
		const validateToken = async () => {
			setIsValidating(true);
			setValidationError(null);

			if (!token) {
				setIsValidating(false);
				return;
			}

			try {
				const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (!response.ok) {
					throw new Error('Token validation failed');
				}

				const userData = await response.json();
				setUser(userData);
			} catch (err) {
				console.warn('Token validation failed:', err);
				setValidationError(err.message);
				// Token is invalid - clear it
				removeToken();
				setToken(null);
				setUser(null);
			} finally {
				setIsValidating(false);
			}
		};

		if (token) {
			validateToken();
		} else {
			setIsValidating(false);
		}
	}, [token]);

	const login = (tokenValue) => {
		saveToken(tokenValue);
		setToken(tokenValue);
	};

	const logout = async () => {
		try {
			// Notify backend to invalidate session on this device
			if (token) {
				await fetch(`${import.meta.env.VITE_API_BASE}/auth/logout`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`
					}
				}).catch(err => console.warn('Logout API call failed:', err));
			}
		} catch (err) {
			console.warn('Error during logout:', err);
		} finally {
			// Always clear local state even if API call fails
			removeToken();
			setToken(null);
			setUser(null);
		}
	};

	const logoutAll = async () => {
		try {
			// Logout from all devices
			if (token) {
				await fetch(`${import.meta.env.VITE_API_BASE}/auth/logout-all`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`
					}
				}).catch(err => console.warn('Logout-all API call failed:', err));
			}
		} catch (err) {
			console.warn('Error during logout-all:', err);
		} finally {
			removeToken();
			setToken(null);
			setUser(null);
		}
	};

	const isAuthenticated = !!token && !isValidating;

	return (
		<AuthContext.Provider value={{ 
			token, 
			user, 
			login, 
			logout,
			logoutAll,
			isAuthenticated,
			isValidating,
			validationError
		}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
