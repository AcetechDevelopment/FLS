// contexts/InwardContext.jsx
import { createContext, useState } from "react";

// ✅ Create the context
export const InwardContext = createContext();

// ✅ Provider component
export const InwardProvider = ({ children }) => {
  // State to store all inward entries
  const [inwards, setInwards] = useState([]);

  return (
    <InwardContext.Provider value={{ inwards, setInwards }}>
      {children}
    </InwardContext.Provider>
  );
};