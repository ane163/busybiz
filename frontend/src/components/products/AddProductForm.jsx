import { useState } from "react";

const AddProductForm = () => {

  const [product, setProduct] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    sku: "",
    barcode: "",
    description: "",
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(product);

    alert("Product saved successfully!");

    setProduct({
      name: "",
      category: "",
      costPrice: "",
      sellingPrice: "",
      quantity: "",
      sku: "",
      barcode: "",
      description: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>

      <h2>Add New Product</h2>

      <br />

      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={product.category}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="costPrice"
        placeholder="Cost Price"
        value={product.costPrice}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="sellingPrice"
        placeholder="Selling Price"
        value={product.sellingPrice}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={product.quantity}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="sku"
        placeholder="SKU"
        value={product.sku}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="barcode"
        placeholder="Barcode"
        value={product.barcode}
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        name="description"
        placeholder="Description"
        value={product.description}
        onChange={handleChange}
      />

      <br /><br />

      <button type="submit">
        Save Product
      </button>

    </form>
  );
};

export default AddProductForm;