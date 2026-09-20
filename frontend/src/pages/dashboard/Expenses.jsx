import { useEffect, useState } from "react";
import api from "../../services/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/expenses");

      setExpenses(response.data);
    } catch (error) {
      console.error("LOAD EXPENSES ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load expenses."
      );
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (e) => {
    e.preventDefault();

    if (!title || !category || !amount) {
      setError(
        "Title, category and amount are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/expenses", {
        title,
        category,
        amount: Number(amount),
        date: date || undefined,
        description
      });

      setMessage("Expense saved successfully.");

      setTitle("");
      setCategory("");
      setAmount("");
      setDate("");
      setDescription("");

      await loadExpenses();
    } catch (error) {
      console.error("CREATE EXPENSE ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/expenses/${id}`);

      setMessage("Expense deleted successfully.");

      await loadExpenses();
    } catch (error) {
      console.error("DELETE EXPENSE ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete expense."
      );
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  if (loading) {
    return (
      <div>
        <h1>Expenses</h1>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Expenses</h1>

      {error && (
        <p>{error}</p>
      )}

      {message && (
        <p>{message}</p>
      )}

      <hr />

      <h2>Add Expense</h2>

      <form onSubmit={createExpense}>
        <div>
          <label>Expense Title</label>
          <br />

          <input
            type="text"
            placeholder="e.g. Shop Rent"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Category</label>
          <br />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              Select Category
            </option>

            <option value="Rent">
              Rent
            </option>

            <option value="Utilities">
              Utilities
            </option>

            <option value="Transport">
              Transport
            </option>

            <option value="Salaries">
              Salaries
            </option>

            <option value="Marketing">
              Marketing
            </option>

            <option value="Supplies">
              Supplies
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <br />

        <div>
          <label>Amount</label>
          <br />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Date</label>
          <br />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />

          <textarea
            rows="4"
            placeholder="Optional description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Expense"}
        </button>
      </form>

      <hr />

      <h2>
        Total Expenses: $
        {totalExpenses.toFixed(2)}
      </h2>

      <h2>Expense History</h2>

      {expenses.length === 0 ? (
        <p>
          No expenses recorded yet.
        </p>
      ) : (
        expenses.map((expense) => (
          <div
            key={expense._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px"
            }}
          >
            <h3>
              {expense.title}
            </h3>

            <p>
              Category:{" "}
              {expense.category}
            </p>

            <p>
              Amount: $
              {Number(
                expense.amount
              ).toFixed(2)}
            </p>

            <p>
              Date:{" "}
              {new Date(
                expense.date
              ).toLocaleDateString()}
            </p>

            {expense.description && (
              <p>
                Description:{" "}
                {expense.description}
              </p>
            )}

            <button
              onClick={() =>
                deleteExpense(
                  expense._id
                )
              }
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Expenses;