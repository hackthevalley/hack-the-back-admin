import PropTypes from 'prop-types';
import { useContext, useEffect, useCallback, useState, createContext } from 'react';
import { useMutate, useGet } from 'restful-react';

import { DEV_IGNORE_AUTH } from '../dev.config';

const UserContext = createContext({});

export function useUser() {
  const { logout, loading, isAuthenticated, user } = useContext(UserContext);
  return {
    isAuthenticated,
    loading,
    logout,
    user,
  };
}

export function withProtected(Component, fallback) {
  return (props) => (
    <Protected fallback={fallback}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...props} />
    </Protected>
  );
}

export function Protected({ children, fallback }) {
  const { loading, isAuthenticated } = useUser();

  if (loading) {
    return 'Loading...';
  }

  if (DEV_IGNORE_AUTH) {
    return children;
  }

  return isAuthenticated ? children : fallback;
}

Protected.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

export function AuthProvider({ children }) {
  const { mutate: refresh } = useMutate({
    path: '/api/account/auth/token/refresh',
    verb: 'POST',
  });

  const { refetch, loading } = useGet('/api/account/users/me', { lazy: true });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(false);

  const logout = useCallback(async () => {
    localStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const login = useCallback(
    async (token) => {
      try {
        localStorage.setItem('auth-token', token);
        const res = await refetch();
        if (!res.isStaffUser) throw new Error('User is not allowed here');
        setIsAuthenticated(true);
        setUser(res);
      } catch (err) {
        localStorage.removeItem('auth-token', token);
        throw err;
      }
    },
    [refetch]
  );

  useEffect(() => {
    const handler = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      try {
        const jwt = await refresh({ token });
        localStorage.setItem('auth-token', jwt.token);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        logout();
      }
    };
    let timer;
    handler().then(() => {
      timer = window.setInterval(handler, 10000);
    });

    return () => {
      window.clearInterval(timer);
    };
  }, [logout]);

  return (
    <UserContext.Provider value={{ login, logout, loading, isAuthenticated, user }}>
      {children}
    </UserContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
