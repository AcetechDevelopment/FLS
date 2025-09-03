import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getInwardByNo,saveDispatch } from "../../utils/fakeapi";
// import React, { useState, useEffect, useRef } from "react";

const DispatchPage = () => {
  // const [formData, setFormData] = useState({
  //   customerName: "",
  //   address: "",
  //   dispatchNo: "",
  //   referenceNo: "",
  //   inwardNo: "",
  // });


 const [formData, setFormData] = useState({
  customerName: "",
  address: "",
  inwardNo: "",
  referenceNo: "",
});

const [materials, setMaterials] = useState([]);

const fetchInwardDetails = (inwardNo) => {
  const inwards = JSON.parse(localStorage.getItem("inwards")) || [];
  const found = inwards.find((i) => i.inwardNo === inwardNo);
  if (found) {
    setFormData({
      inwardNo: found.inwardNo,
      customerName: found.customerName,
      address: found.address,
      referenceNo: found.referenceNo,
    });
    setMaterials(found.materials);
  } else {
    alert("Inward not found!");
    setMaterials([]);
  }
};



  const handleInwardLookup = async () => {
  try {
    const inward = await getInwardByNo(formData.inwardNo);
    setFormData((prev) => ({
      ...prev,
      customerName: inward.customerName,
      address: inward.address,
      referenceNo: inward.referenceNo,
    }));
    setMaterials(inward.materials || []);
  } catch (err) {
    alert(err.message);
    setFormData((prev) => ({
      ...prev,
      customerName: "",
      address: "",
      referenceNo: "",
    }));
    setMaterials([]);
  }
};

  // const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", quantity: "" });

  // 🔹 Refs for inputs
  const inwardRef = useRef();
  const customerRef = useRef();
  const addressRef = useRef();
  const dispatchRef = useRef();
  const referenceRef = useRef();
  const materialRef = useRef();
  const qtyRef = useRef();
  const addBtnRef = useRef();

  const focusNext = (ref) => {
    ref.current && ref.current.focus();
  };

  const isNumberKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) e.preventDefault();
  };

  useEffect(() => {
    const randomDispatch = "DSP-" + Math.floor(1000 + Math.random() * 9000);
    const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);

    setFormData((prev) => ({
      ...prev,
      dispatchNo: randomDispatch,
      referenceNo: randomRef,
    }));
  }, []);

  // useEffect(() => {
  //   if (!formData.inwardNo) return;

  //   const inwardData = JSON.parse(localStorage.getItem("inwards")) || [];

  //   const found = inwardData.find((entry) => entry.inwardNo === formData.inwardNo);

  //   if (found) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       customerName: found.customerName,
  //       address: found.address,
  //       referenceNo: found.referenceNo,
  //     }));
  //     setMaterials(found.materials || []);
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       customerName: "",
  //       address: "",
  //       referenceNo: "",
  //     }));
  //     setMaterials([]);
  //   }
  // }, [formData.inwardNo]);

  useEffect(() => {
  if (!formData.inwardNo) return;

  const inwardData = JSON.parse(localStorage.getItem("inwards")) || [];
  const found = inwardData.find((entry) => entry.inwardNo === formData.inwardNo);

  if (found) {
    setFormData((prev) => ({
      ...prev,
      customerName: found.customerName,
      address: found.address,
      referenceNo: found.referenceNo,
    }));
    setMaterials(found.materials || []);
  } else {
    setFormData((prev) => ({
      ...prev,
      customerName: "",
      address: "",
      referenceNo: "",
    }));
    setMaterials([]);
  }
}, [formData.inwardNo]);

// const fetchInwardDetails = (inwardNo) => {


//   const inwardData = JSON.parse(localStorage.getItem("inwards")) || [];
//   const found = inwardData.find((entry) => entry.inwardNo === inwardNo);

//   if (found) {
//     setFormData((prev) => ({
//       ...prev,
//       customerName: found.customerName,
//       address: found.address,
//       referenceNo: found.referenceNo,
//     }));
//     setMaterials(found.materials || []);
//   } else {
//     alert("No Inward found with this number!");
//     setFormData((prev) => ({
//       ...prev,
//       customerName: "",
//       address: "",
//       referenceNo: "",
//     }));
//     setMaterials([]);
//   }
// };


  const handleAddMaterial = () => {
    if (!newMaterial.material || !newMaterial.quantity) return;
    setMaterials([...materials, { ...newMaterial, id: materials.length + 1 }]);
    setNewMaterial({ material: "", quantity: "" });
    focusNext(materialRef); // focus back to material input
  };

  const handleRemove = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };


  const handleSubmit = async () => {
  const dispatch = {
    ...formData,
    materials,
    date: new Date().toISOString(),
  };
  await saveDispatch(dispatch);
  alert("Dispatch saved!");
  setFormData({ inwardNo: "", customerName: "", address: "", referenceNo: "" });
  setMaterials([]);
};

  return (
    <div className="container" style={{ fontSize: "12px" }}>
      <div className="row align-items-center g-1">
        <div className="col-md-2">
          {/* <input
            ref={inwardRef}
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
            placeholder="Inward Number"
            value={formData.inwardNo}
            onChange={(e) => setFormData({ ...formData, inwardNo: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && focusNext(customerRef)}
          /> */}
          {/* <input
  ref={inwardRef}
  type="text"
  className="form-control form-control-sm"
  style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
  placeholder="Inward Number"
  value={formData.inwardNo}
  onChange={(e) => setFormData({ ...formData, inwardNo: e.target.value })}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      fetchInwardDetails(formData.inwardNo); // ✅ get inward details
      focusNext(customerRef);
    }
  }}
/> */}

{/* <input
  ref={inwardRef}
  type="text"
  className="form-control form-control-sm"
  value={formData.inwardNo}
  onChange={(e) => setFormData({ ...formData, inwardNo: e.target.value })}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleInwardLookup();
      focusNext(customerRef);
    }
  }}
/> */}


<input
  ref={inwardRef}
  type="text"
  className="form-control form-control-sm"
  style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
  placeholder="Inward Number"
  value={formData.inwardNo}
  onChange={(e) =>
    setFormData({ ...formData, inwardNo: e.target.value })
  }
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      fetchInwardDetails(formData.inwardNo);
      focusNext(customerRef);
    }
  }}
/>
    </div>

        <div className="col-md-3">
          <input
            ref={customerRef}
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
            placeholder="Customer Name"
            value={formData.customerName}
            readOnly
            onKeyDown={(e) => e.key === "Enter" && focusNext(addressRef)}
          />
        </div>

        <div className="col-md-3">
          <textarea
            ref={addressRef}
            className="form-control form-control-sm"
            style={{ fontSize: "11px", height: "24px", padding: "0 4px" }}
            placeholder="Address"
            value={formData.address}
            readOnly
            onKeyDown={(e) => e.key === "Enter" && focusNext(dispatchRef)}
          />
        </div>

        <div className="col-md-2">
          <input
            ref={dispatchRef}
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
            placeholder="Dispatch Number"
            value={formData.dispatchNo}
            readOnly
            onKeyDown={(e) => e.key === "Enter" && focusNext(referenceRef)}
          />
        </div>

        <div className="col-md-2">
          <input
            ref={referenceRef}
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
            placeholder="Reference No."
            value={formData.referenceNo}
            readOnly
            onKeyDown={(e) => e.key === "Enter" && focusNext(materialRef)}
          />
        </div>
      </div>

      <div className="mt-3">
        <table className="table table-bordered table-sm" style={{ fontSize: "11px", marginBottom: "6px" }}>
          <thead className="table-light text-center">
            <tr style={{ fontSize: "11px", lineHeight: "1.6" }}>
              <th style={{ width: "6%", padding: "2px" }}>Sl.No</th>
              <th style={{ padding: "2px" }}>Material</th>
              <th style={{ width: "14%", padding: "2px" }}>Qty</th>
              <th style={{ width: "10%", padding: "2px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, index) => (
              <tr key={m.id} className="text-center">
                <td>{index + 1}</td>
                <td>{m.material}</td>
                <td>{m.quantity}</td>
                <td>
                  <button
                    className="btn btn-sm p-0"
                    title="Delete"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => handleRemove(m.id)}
                  >
                    <span className="material-icons-two-tone text-danger" style={{ fontSize: "16px", cursor: "pointer" }}>
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <div className="row g-1 align-items-center">
          <div className="col-md-6">
            <input
              ref={materialRef}
              type="text"
              className="form-control form-control-sm"
              style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
              placeholder="Material"
              value={newMaterial.material}
              onChange={(e) => setNewMaterial({ ...newMaterial, material: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && focusNext(qtyRef)}
            />
          </div>
          <div className="col-md-3">
            <input
              ref={qtyRef}
              type="text"
              className="form-control form-control-sm"
              style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
              placeholder="Qty"
              value={newMaterial.quantity}
              onKeyDown={(e) => {
                isNumberKey(e);
                if (e.key === "Enter") focusNext(addBtnRef);
              }}
              onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <button
              ref={addBtnRef}
              className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
              onClick={handleAddMaterial}
              style={{ borderRadius: "50%", width: "22px", height: "22px", fontSize: "13px", padding: 0, cursor: "pointer" }}
            >
              +
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DispatchPage;