import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  FaCamera,
  FaUser,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import {
  useNavigate
} from "react-router-dom";

import "./Profile.css";


const Profile = () => {

  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);


  const [user, setUser] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      if (!token) {

        navigate("/login");

        return;

      }


      const response =
        await fetch(
          "https://busybiz-5.onrender.com/api/users/profile",
          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load profile."
        );

      }


      setUser(
        data.user
      );


    } catch (err) {

      console.error(
        "PROFILE LOAD ERROR:",
        err
      );


      setError(
        err.message
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadProfile();

  }, []);


  // =====================================================
  // SELECT IMAGE
  // =====================================================

  const handleFileChange =
    (event) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      setMessage("");
      setError("");


      // ==========================================
      // FILE TYPE
      // ==========================================

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        setError(
          "Please choose a JPG, PNG or WEBP image."
        );

        return;

      }


      // ==========================================
      // FILE SIZE
      // ==========================================

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        setError(
          "Image must be smaller than 5MB."
        );

        return;

      }


      setSelectedFile(
        file
      );


      setPreview(
        URL.createObjectURL(
          file
        )
      );

    };


  // =====================================================
  // UPLOAD
  // =====================================================

  const uploadPicture =
    async () => {

      if (!selectedFile) {

        setError(
          "Please select a picture first."
        );

        return;

      }


      try {

        setUploading(true);

        setMessage("");
        setError("");


        const token =
          localStorage.getItem(
            "token"
          );


        const formData =
          new FormData();


        formData.append(
          "profilePicture",
          selectedFile
        );


        const response =
          await fetch(
            "https://busybiz-5.onrender.com/api/users/profile-picture",
            {

              method: "PUT",

              headers: {

                Authorization:
                  `Bearer ${token}`

              },

              body:
                formData

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Upload failed."
          );

        }


        setUser(
          data.user
        );


        // ==========================================
        // UPDATE LOCAL STORAGE
        // ==========================================

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );


        setSelectedFile(
          null
        );


        setPreview(
          null
        );


        setMessage(
          "Profile picture updated successfully."
        );


        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }


        // ==========================================
        // NOTIFY OTHER COMPONENTS
        // ==========================================

        window.dispatchEvent(
          new Event(
            "profileUpdated"
          )
        );


      } catch (err) {

        console.error(
          "UPLOAD ERROR:",
          err
        );


        setError(
          err.message
        );


      } finally {

        setUploading(false);

      }

    };


  // =====================================================
  // REMOVE
  // =====================================================

  const removePicture =
    async () => {

      try {

        setUploading(true);

        setMessage("");
        setError("");


        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await fetch(
            "https://busybiz-5.onrender.com/api/users/profile-picture",
            {

              method: "DELETE",

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to remove picture."
          );

        }


        setUser(
          data.user
        );


        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );


        setPreview(
          null
        );


        setSelectedFile(
          null
        );


        setMessage(
          "Profile picture removed."
        );


        window.dispatchEvent(
          new Event(
            "profileUpdated"
          )
        );


      } catch (err) {

        console.error(
          "REMOVE ERROR:",
          err
        );


        setError(
          err.message
        );


      } finally {

        setUploading(false);

      }

    };


  // =====================================================
  // INITIALS
  // =====================================================

  const fullName =
    user?.fullName ||
    "Business Owner";


  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map(
        word =>
          word[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();


  // =====================================================
  // IMAGE
  // =====================================================

  const imageUrl =
    user?.profilePicture
      ? user.profilePicture.startsWith(
          "http"
        )
        ? user.profilePicture
        : `https://busybiz-5.onrender.com${user.profilePicture}`
      : null;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-loading">

        Loading profile...

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-page-header">

        <button
          className="profile-back"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <FaArrowLeft />

          Dashboard

        </button>


        <div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your BusyBiz profile.
          </p>

        </div>

      </div>


      {/* CONTENT */}

      <div className="profile-content">


        {/* PROFILE CARD */}

        <div className="profile-card">


          <div className="profile-card-header">

            <div>

              <h2>
                Profile Picture
              </h2>

              <p>
                This picture will appear
                across your BusyBiz dashboard.
              </p>

            </div>

          </div>


          {/* AVATAR */}

          <div className="profile-photo-area">

            <div className="large-profile-avatar">

              {preview ? (

                <img
                  src={preview}
                  alt="Preview"
                />

              ) : imageUrl ? (

                <img
                  src={imageUrl}
                  alt={fullName}
                />

              ) : (

                <span>
                  {initials}
                </span>

              )}

            </div>


            <div className="photo-actions">

              <button
                className="choose-photo"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <FaCamera />

                Change Picture

              </button>


              {(imageUrl || preview) && (

                <button
                  className="remove-photo"
                  onClick={
                    selectedFile
                      ? () => {
                          setSelectedFile(null);
                          setPreview(null);
                        }
                      : removePicture
                  }
                  disabled={uploading}
                >

                  <FaTrash />

                  {selectedFile
                    ? "Cancel"
                    : "Remove"}

                </button>

              )}

            </div>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={
                handleFileChange
              }
              hidden
            />


            <span className="photo-help">

              JPG, PNG or WEBP · Maximum 5MB

            </span>

          </div>


          {/* SAVE */}

          {selectedFile && (

            <button
              className="save-photo"
              onClick={uploadPicture}
              disabled={uploading}
            >

              {uploading
                ? "Uploading..."
                : "Save Profile Picture"}

            </button>

          )}


          {/* MESSAGES */}

          {message && (

            <div className="profile-success">

              {message}

            </div>

          )}


          {error && (

            <div className="profile-error">

              {error}

            </div>

          )}

        </div>


        {/* INFORMATION CARD */}

        <div className="profile-card profile-information">

          <h2>
            Account Information
          </h2>


          <div className="profile-field">

            <span>
              Full Name
            </span>

            <strong>
              {user?.fullName ||
                "Not provided"}
            </strong>

          </div>


          <div className="profile-field">

            <span>
              Email
            </span>

            <strong>
              {user?.email ||
                "Not provided"}
            </strong>

          </div>


          <div className="profile-field">

            <span>
              Account Type
            </span>

            <strong>
              {user?.role === "admin"
                ? "Administrator"
                : "Business User"}
            </strong>

          </div>

        </div>

      </div>

    </div>

  );

};


export default Profile;
