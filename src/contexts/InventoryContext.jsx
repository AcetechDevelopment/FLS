// contexts/InventoryContext.js
import { createContext, useState } from "react";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);

  return (
    <InventoryContext.Provider value={{ materials, setMaterials }}>
      {children}
    </InventoryContext.Provider>
  );
};