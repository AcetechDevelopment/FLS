// utils/fakeApi.js

// ✅ simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getInwardByNo = async (inwardNo) => {
  await delay(500); // simulate API response delay
  const inwards = JSON.parse(localStorage.getItem("inwards")) || [];
  const found = inwards.find((i) => i.inwardNo === inwardNo);
  if (!found) throw new Error("Inward not found");
  return found;
};

export const saveInward = async (inward) => {
  await delay(300);
  const inwards = JSON.parse(localStorage.getItem("inwards")) || [];
  inwards.push(inward);
  localStorage.setItem("inwards", JSON.stringify(inwards));
  return inward;
};

export const saveDispatch = async (dispatch) => {
  await delay(300);
  const dispatches = JSON.parse(localStorage.getItem("dispatches")) || [];
  dispatches.push(dispatch);
  localStorage.setItem("dispatches", JSON.stringify(dispatches));
  return dispatch;
};

export const getDispatches = async () => {
  await delay(300);
  return JSON.parse(localStorage.getItem("dispatches")) || [];
};
