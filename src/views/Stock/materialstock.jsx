import { useContext } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";

const MaterialStock = () => {
  const { materials } = useContext(MaterialContext);

  return (
    <div className="container">
      <h3>Material Stock</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Material Code</th>
            <th>Material Name</th>
            <th>Default Price</th>
            <th>Material Type</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td>{m.materialCode}</td>
              <td>{m.materialName}</td>
              <td>{m.defaultPrice}</td>
              <td>{m.materialType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialStock;
