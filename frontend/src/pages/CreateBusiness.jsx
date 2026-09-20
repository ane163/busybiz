import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateBusiness() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    description: "",
    phone: "",
    location: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append("businessName", formData.businessName);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("phone", formData.phone);
      data.append("location", formData.location);

      if (image) {
        data.append("image", image);
      }

      const response = await api.post("/businesses", data);

      setSuccess(
        response.data.message || "Business created successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create business."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Your Business</h1>

      <p>
        Add your business information to get started with BusyBiz.
      </p>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Business Name</label>

          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
            required
          />
        </div>


        <div>
          <label>Category</label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Restaurant, Electronics, Barber"
            required
          />
        </div>


        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your business"
            required
          />
        </div>


        <div>
          <label>Phone</label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Business phone number"
            required
          />
        </div>


        <div>
          <label>Location</label>

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Business location"
            required
          />
        </div>


        <div>
          <label>Business Logo</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>


        {error && <p>{error}</p>}

        {success && <p>{success}</p>}


        <button type="submit" disabled={loading}>
          {loading ? "Creating Business..." : "Create Business"}
        </button>

      </form>
    </div>
  );
}

export default CreateBusiness;