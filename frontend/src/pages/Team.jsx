import { useEffect, useState } from "react";
import api from "../services/api";

function Team() {
  const [members, setMembers] = useState([]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =====================================================
  // LOAD TEAM
  // =====================================================

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/team");

      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setMembers([]);
      }

    } catch (error) {
      console.error(
        "LOAD TEAM ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load team."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTeam();
  }, []);


  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "Please enter the user's email."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await api.post("/team/add", {
          email: email.trim(),
          role
        });

      setSuccess(
        response.data?.message ||
          "Team member added successfully."
      );

      setEmail("");
      setRole("employee");

      await loadTeam();

    } catch (error) {
      console.error(
        "ADD MEMBER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to add team member."
      );

    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // CHANGE ROLE
  // =====================================================

  const handleRoleChange = async (
    memberId,
    newRole
  ) => {
    try {
      setError("");
      setSuccess("");

      await api.put(
        `/team/${memberId}/role`,
        {
          role: newRole
        }
      );

      setSuccess(
        "Team member role updated successfully."
      );

      await loadTeam();

    } catch (error) {
      console.error(
        "UPDATE ROLE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update role."
      );
    }
  };


  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (
    memberId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this team member?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/team/${memberId}`
      );

      setSuccess(
        "Team member removed successfully."
      );

      await loadTeam();

    } catch (error) {
      console.error(
        "REMOVE MEMBER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove team member."
      );
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="team-page">
        <div className="team-container">
          <h1 className="team-title">
            Team
          </h1>

          <p className="team-loading">
            Loading team...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="team-page">

      <div className="team-container">

        {/* HEADER */}

        <div className="team-header">

          <div>
            <h1 className="team-title">
              Team
            </h1>

            <p className="team-subtitle">
              Manage the people who work
              in your business.
            </p>
          </div>

          <button
            type="button"
            className="team-refresh-button"
            onClick={loadTeam}
          >
            Refresh
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="team-alert team-error">
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="team-alert team-success">
            {success}
          </div>
        )}


        {/* ADD MEMBER */}

        <div className="team-card">

          <h2 className="team-card-title">
            Add Team Member
          </h2>

          <p className="team-card-description">
            The user must already have a
            BusyBiz account.
          </p>


          <form
            className="team-form"
            onSubmit={handleAddMember}
          >

            <div className="team-field">

              <label
                className="team-label"
                htmlFor="team-email"
              >
                User Email
              </label>

              <input
                id="team-email"
                className="team-input"
                type="email"
                placeholder="employee@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            <div className="team-field">

              <label
                className="team-label"
                htmlFor="team-role"
              >
                Role
              </label>

              <select
                id="team-role"
                className="team-input"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >

                <option value="admin">
                  Admin
                </option>

                <option value="manager">
                  Manager
                </option>

                <option value="employee">
                  Employee
                </option>

              </select>

            </div>


            <div className="team-actions">

              <button
                type="submit"
                className="team-add-button"
                disabled={saving}
              >
                {saving
                  ? "Adding..."
                  : "Add Team Member"}
              </button>

            </div>

          </form>

        </div>


        {/* TEAM LIST */}

        <div className="team-card">

          <div className="team-list-header">

            <div>
              <h2 className="team-card-title">
                Business Team
              </h2>

              <p className="team-card-description">
                {members.length} team member
                {members.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

          </div>


          {members.length === 0 ? (

            <div className="team-empty">

              <h3>
                No team members yet
              </h3>

              <p>
                Add your first team member
                above.
              </p>

            </div>

          ) : (

            <div className="team-table-wrapper">

              <table className="team-table">

                <thead>

                  <tr>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {members.map((member) => (

                    <tr
                      key={member._id}
                    >

                      <td>
                        {member.user?.name ||
                          "Unknown User"}
                      </td>

                      <td>
                        {member.user?.email ||
                          "-"}
                      </td>

                      <td>

                        {member.role ===
                        "owner" ? (

                          <span className="team-owner">
                            Owner
                          </span>

                        ) : (

                          <select
                            className="team-role-select"
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member._id,
                                e.target.value
                              )
                            }
                          >

                            <option value="admin">
                              Admin
                            </option>

                            <option value="manager">
                              Manager
                            </option>

                            <option value="employee">
                              Employee
                            </option>

                          </select>

                        )}

                      </td>


                      <td>

                        <span className="team-status">
                          {member.status}
                        </span>

                      </td>


                      <td>

                        {member.role !==
                          "owner" && (

                          <button
                            type="button"
                            className="team-remove-button"
                            onClick={() =>
                              handleRemoveMember(
                                member._id
                              )
                            }
                          >
                            Remove
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Team;