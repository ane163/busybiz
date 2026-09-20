import { useEffect, useState } from "react";
import api from "../../services/api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    status: "active"
  });


  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  useEffect(() => {
    loadSuppliers();
  }, []);


  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/suppliers");

      setSuppliers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "LOAD SUPPLIERS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load suppliers."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setForm({
      name: "",
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      status: "active"
    });

    setEditingId(null);
  };


  // =====================================================
  // CREATE / UPDATE SUPPLIER
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


    if (!form.name.trim()) {

      setError(
        "Supplier name is required."
      );

      return;
    }


    try {

      setSaving(true);


      if (editingId) {

        // =================================================
        // UPDATE
        // =================================================

        const response =
          await api.put(
            `/suppliers/${editingId}`,
            form
          );

        setMessage(
          response.data.message ||
          "Supplier updated successfully."
        );

      } else {

        // =================================================
        // CREATE
        // =================================================

        const response =
          await api.post(
            "/suppliers",
            form
          );

        setMessage(
          response.data.message ||
          "Supplier created successfully."
        );
      }


      resetForm();

      await loadSuppliers();

    } catch (error) {

      console.error(
        "SAVE SUPPLIER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to save supplier."
      );

    } finally {

      setSaving(false);

    }
  };


  // =====================================================
  // EDIT SUPPLIER
  // =====================================================

  const handleEdit = (supplier) => {

    setEditingId(
      supplier._id
    );

    setForm({

      name:
        supplier.name || "",

      companyName:
        supplier.companyName || "",

      contactPerson:
        supplier.contactPerson || "",

      phone:
        supplier.phone || "",

      email:
        supplier.email || "",

      address:
        supplier.address || "",

      notes:
        supplier.notes || "",

      status:
        supplier.status || "active"

    });

    setError("");
    setMessage("");


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =====================================================
  // DELETE SUPPLIER
  // =====================================================

  const handleDelete = async (supplierId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this supplier?"
      );

    if (!confirmed) {
      return;
    }


    try {

      setError("");
      setMessage("");


      const response =
        await api.delete(
          `/suppliers/${supplierId}`
        );


      setMessage(
        response.data.message ||
        "Supplier deleted successfully."
      );


      if (
        editingId === supplierId
      ) {
        resetForm();
      }


      await loadSuppliers();

    } catch (error) {

      console.error(
        "DELETE SUPPLIER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to delete supplier."
      );

    }
  };


  // =====================================================
  // FILTER SUPPLIERS
  // =====================================================

  const filteredSuppliers =
    suppliers.filter((supplier) => {

      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }


      return (

        supplier.name
          ?.toLowerCase()
          .includes(searchText)

        ||

        supplier.companyName
          ?.toLowerCase()
          .includes(searchText)

        ||

        supplier.contactPerson
          ?.toLowerCase()
          .includes(searchText)

        ||

        supplier.phone
          ?.toLowerCase()
          .includes(searchText)

        ||

        supplier.email
          ?.toLowerCase()
          .includes(searchText)

      );
    });


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div>
        <h1>Suppliers</h1>

        <p>
          Loading suppliers...
        </p>
      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div>

      <h1>
        Suppliers
      </h1>


      {error && (
        <div>
          {error}
        </div>
      )}


      {message && (
        <div>
          {message}
        </div>
      )}


      {/* =================================================
          SUPPLIER FORM
      ================================================= */}

      <section>

        <h2>
          {editingId
            ? "Edit Supplier"
            : "Add Supplier"}
        </h2>


        <form
          onSubmit={handleSubmit}
        >

          {/* SUPPLIER NAME */}

          <div>

            <label>
              Supplier Name *
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Supplier name"
              required
            />

          </div>


          {/* COMPANY */}

          <div>

            <label>
              Company Name
            </label>

            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Company name"
            />

          </div>


          {/* CONTACT PERSON */}

          <div>

            <label>
              Contact Person
            </label>

            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              placeholder="Contact person"
            />

          </div>


          {/* PHONE */}

          <div>

            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />

          </div>


          {/* EMAIL */}

          <div>

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
            />

          </div>


          {/* ADDRESS */}

          <div>

            <label>
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Supplier address"
              rows="3"
            />

          </div>


          {/* NOTES */}

          <div>

            <label>
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows="3"
            />

          </div>


          {/* STATUS */}

          <div>

            <label>
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>


          <br />


          <button
            type="submit"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : editingId
                ? "Update Supplier"
                : "Add Supplier"}

          </button>


          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </form>

      </section>


      <hr />


      {/* =================================================
          SEARCH
      ================================================= */}

      <section>

        <h2>
          Supplier List
        </h2>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search suppliers..."
        />

      </section>


      <br />


      {/* =================================================
          SUPPLIERS
      ================================================= */}

      {filteredSuppliers.length === 0 ? (

        <p>
          {search
            ? "No suppliers match your search."
            : "No suppliers have been added yet."}
        </p>

      ) : (

        <div>

          {filteredSuppliers.map(
            (supplier) => (

              <div
                key={supplier._id}
              >

                <h3>
                  {supplier.name}
                </h3>


                {supplier.companyName && (
                  <p>
                    Company:{" "}
                    {supplier.companyName}
                  </p>
                )}


                {supplier.contactPerson && (
                  <p>
                    Contact:{" "}
                    {supplier.contactPerson}
                  </p>
                )}


                {supplier.phone && (
                  <p>
                    Phone:{" "}
                    {supplier.phone}
                  </p>
                )}


                {supplier.email && (
                  <p>
                    Email:{" "}
                    {supplier.email}
                  </p>
                )}


                {supplier.address && (
                  <p>
                    Address:{" "}
                    {supplier.address}
                  </p>
                )}


                <p>
                  Status:{" "}
                  {supplier.status}
                </p>


                {supplier.notes && (
                  <p>
                    Notes:{" "}
                    {supplier.notes}
                  </p>
                )}


                <button
                  type="button"
                  onClick={() =>
                    handleEdit(
                      supplier
                    )
                  }
                >
                  Edit
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      supplier._id
                    )
                  }
                >
                  Delete
                </button>


                <hr />

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Suppliers;