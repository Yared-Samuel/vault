// Role-based access utilities
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@/pages/context/AuthProvider';

export function hasRole(auth, roles) {
  if (!auth?.role) return false;
  if (Array.isArray(roles)) return roles.includes(auth.role);
  return auth.role === roles;
}

// React hook to require a role and redirect if not authorized
export function useRequireRole(roles, redirectTo = '/unauthorized') {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (auth && !hasRole(auth, roles)) {
      router.replace(redirectTo);
    }
  }, [auth, roles, router, redirectTo]);

  if (auth === null) {
    return null;
  }

  return hasRole(auth, roles);
}

// React component to render children only if user has required role(s)
export function RequireRole({ roles, children, fallback = null, loading = <div>Loading...</div> }) {
  const { auth } = useContext(AuthContext);
  if (auth === null) {
    return loading;
  }
  if (hasRole(auth, roles)) {
    return children;
  }
  return fallback;
}