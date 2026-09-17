import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../contexts/AuthContext';


function Sidebar (){
    const { logado, logout } = useAuth();
    const linkClass = ({isActive}) => 
        isActive ? styles.link + ' ' + styles.ativo : styles.link;

    return(
        <aside className={styles.sidebar}>

            <div className={styles.logo}>
                <h1>TaskFlow</h1>
            </div>
            <nav className={styles.nav}>
                <NavLink to= '/' className={linkClass}>Dashboard</NavLink>
                <NavLink to= '/sobre' className={linkClass}>Sobre</NavLink>
                <NavLink to= '/login' className={linkClass}>Login</NavLink>
            </nav>

            {logado && (<button onClick={logout}>Sair</button>)}

        </aside>
    )
}

export default Sidebar