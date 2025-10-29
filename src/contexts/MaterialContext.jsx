import { createContext, useState } from "react";

export const MaterialContext = createContext();

export const MaterialProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);

  return (
    <MaterialContext.Provider value={{ materials, setMaterials }}>
      {children}
    </MaterialContext.Provider>
  );
};