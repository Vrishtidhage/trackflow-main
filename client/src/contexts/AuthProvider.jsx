import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { getTokenPayload } from "../utils/auth";

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => getTokenPayload());
	const [loading, setLoading] = useState(false);
	return (
		<AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
			{children}
		</AuthContext.Provider>
	);
}
