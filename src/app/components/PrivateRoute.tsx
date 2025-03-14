import React from 'react';
import { useRouter } from 'next/router';

interface PrivateRouteProps {
    children: React.ReactNode; // Define the type for children
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const router = useRouter();
    // Your logic here...
    return <>{children}</>;
};

export default PrivateRoute;
