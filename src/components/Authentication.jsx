import PropTypes from 'prop-types';
import { useContext, useEffect, useCallback, useState, createContext } from 'react';

const UserContext = createContext({});

export function useUser() {
  const { fetchUser, isLoaded, user } = useContext(UserContext);

  useEffect(() => {
    if (isLoaded) return;
    fetchUser();
  }, [fetchUser, isLoaded]);

  return { user, isLoaded };
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
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return 'Loading...';
  }

  return user ? children : fallback;
}

Protected.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

export function AuthProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    if (isLoaded) return user;

    // TODO: Fetch user auth
    setIsLoaded(true);
    setUser(null);
    return null;
  }, [isLoaded, user]);

  return (
    <UserContext.Provider value={{ fetchUser, isLoaded, user }}>{children}</UserContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
