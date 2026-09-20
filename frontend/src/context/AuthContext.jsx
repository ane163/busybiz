import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    const token =
      localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser =
          JSON.parse(savedUser);

        setUser(parsedUser);

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

      } catch (error) {
        console.error(
          "AUTH RESTORE ERROR:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      token
    );

    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    delete api.defaults.headers.common[
      "Authorization"
    ];

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);