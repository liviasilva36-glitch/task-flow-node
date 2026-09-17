import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [usuario, setUsuario] = useState(null);

  function login(dadosUsuario, tokenRecebido) {
    setToken(tokenRecebido);
    setUsuario(dadosUsuario);

    localStorage.setItem("token", tokenRecebido);
  }

  function logout() {
    setToken(null);
    setUsuario(null);

    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro do AuthProvider"
    );
  }

  return context;
}
