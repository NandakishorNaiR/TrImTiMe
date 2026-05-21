import React from 'react';
export const BookingContext = React.createContext(null);
export default function BookingProvider({ children }){ return <BookingContext.Provider value={{}}>{children}</BookingContext.Provider> }
