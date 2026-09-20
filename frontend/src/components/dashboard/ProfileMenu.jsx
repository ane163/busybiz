import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

const ProfileMenu = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateProfile = () => {
      try {
        setUser(
          JSON.parse(
            localStorage.getItem("user")
          )
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(
      "profileUpdated",
      updateProfile
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        updateProfile
      );
    };
  }, []);

  const fullName =
    user?.fullName || "Business Owner";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const profileImage =
    user?.profilePicture
      ? user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `${API_URL}${user.profilePicture}`
      : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div
      style={{
        position: "relative"
      }}
    >
      {/* PROFILE BUTTON */}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "2px solid #e5e5e5",
          background: "#111",
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={fullName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              fontWeight: "700"
            }}
          >
            {initials || "U"}
          </span>
        )}
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          style={{
            position: "absolute",
            top: "55px",
            right: 0,
            width: "240px",
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "14px",
            padding: "10px",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.12)",
            zIndex: 9999
          }}
        >
          {/* USER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              borderBottom:
                "1px solid #eee",
              marginBottom: "6px"
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "700"
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                initials || "U"
              )}
            </div>

            <div
              style={{
                minWidth: 0
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {fullName}
              </strong>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#888",
                  marginTop: "3px"
                }}
              >
                {user?.email || "Business User"}
              </span>
            </div>
          </div>

          {/* PROFILE */}

          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "11px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "8px",
              textAlign: "left"
            }}
          >
            <FaUser />

            My Profile
          </button>

          {/* SETTINGS */}

          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "11px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "8px",
              textAlign: "left"
            }}
          >
            <FaCog />

            Settings
          </button>

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              border: "none",
              background: "#fff5f5",
              color: "#c0392b",
              padding: "11px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "8px",
              textAlign: "left",
              marginTop: "5px"
            }}
          >
            <FaSignOutAlt />

            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;