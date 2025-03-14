import React from 'react';
import { useRouter } from 'next/router';

interface PublicRouteProps {
    children: React.ReactNode; // Define the type for children
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const router = useRouter();
    // Your logic here...
    return <>{children}</>;
};

export default PublicRoute;
