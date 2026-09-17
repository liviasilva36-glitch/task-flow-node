import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState('analiiv@email.com');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  function handleLogin(e) {
    if (e) e.preventDefault();
    setErro('');

    // Validação local de e-mail e senha
    if (email === 'analiiv@email.com' && senha === '123456') {
      const tokenMock = "token-autenticado-123456";
      const usuarioMock = { id: 1, nome: 'Ana', email };

      // Salva a sessão no contexto e navega para a página inicial
      login(usuarioMock, tokenMock);
      navigate('/');
    } else {
      // Exibe mensagem de erro se a senha ou e-mail estiverem errados
      setErro('E-mail ou senha incorretos');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="login-container">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <h1 className="login-logo">TaskFlow</h1>
        <p className="login-subtitulo">Faça login para continuar</p>

        {erro && <p className="login-erro">{erro}</p>}

        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button className="login-button" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;