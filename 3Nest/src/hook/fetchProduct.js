
export const fetchProductsByTypeAndRole = async ({ baseUrl, typeId, role, token }) => {
  if (!baseUrl || !typeId || !role) {
    throw new Error("Missing required parameters");
  }

  const url = `${baseUrl}/products/get-products-by-role-and-type?role=${role}&type_id=${typeId}`;
  console.log("Fetching products from:", url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    }
  });

  const result = await response.json();
  console.log('Products API response:', result);

  if (result.status_code === 200 && Array.isArray(result.data)) {
    return result.data;
  } else {
    throw new Error(result.mess || "Invalid product data format");
  }
};
