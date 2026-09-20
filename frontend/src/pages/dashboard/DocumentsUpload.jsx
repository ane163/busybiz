import {
  useRef,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "./DocumentsUpload.css";


function DocumentsUpload() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  // =====================================================
  // STATE
  // =====================================================

  const [file, setFile] =
    useState(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [type, setType] =
    useState("Document");

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [dragging, setDragging] =
    useState(false);


  // =====================================================
  // ALLOWED FILE TYPES
  // =====================================================

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".txt"
  ];


  const maximumFileSize =
    10 * 1024 * 1024;


  // =====================================================
  // VALIDATE FILE
  // =====================================================

  const validateFile =
    (selectedFile) => {

      if (!selectedFile) {

        return "Please select a document.";

      }


      if (
        selectedFile.size >
        maximumFileSize
      ) {

        return (
          "File is too large. " +
          "Maximum allowed size is 10 MB."
        );

      }


      const fileName =
        selectedFile.name.toLowerCase();


      const extension =
        fileName.substring(
          fileName.lastIndexOf(".")
        );


      if (
        !allowedExtensions.includes(
          extension
        )
      ) {

        return (
          "This file type is not supported. " +
          "Please upload PDF, Word, Excel, image or text files."
        );

      }


      return "";

    };


  // =====================================================
  // SELECT FILE
  // =====================================================

  const selectFile =
    (selectedFile) => {

      setError("");
      setSuccess("");


      const validationError =
        validateFile(
          selectedFile
        );


      if (validationError) {

        setFile(null);

        setError(
          validationError
        );

        return;

      }


      setFile(
        selectedFile
      );


      /*
       * Automatically use the filename
       * if the user hasn't entered a name.
       */

      if (!name.trim()) {

        const originalName =
          selectedFile.name;


        const extensionIndex =
          originalName.lastIndexOf(".");


        const cleanName =
          extensionIndex > 0
            ? originalName.substring(
                0,
                extensionIndex
              )
            : originalName;


        setName(
          cleanName
        );

      }

    };


  // =====================================================
  // FILE INPUT
  // =====================================================

  const handleFileChange =
    (event) => {

      const selectedFile =
        event.target.files?.[0];


      selectFile(
        selectedFile
      );

    };


  // =====================================================
  // DRAG EVENTS
  // =====================================================

  const handleDragOver =
    (event) => {

      event.preventDefault();

      setDragging(true);

    };


  const handleDragLeave =
    (event) => {

      event.preventDefault();

      setDragging(false);

    };


  const handleDrop =
    (event) => {

      event.preventDefault();

      setDragging(false);


      const droppedFile =
        event.dataTransfer.files?.[0];


      selectFile(
        droppedFile
      );

    };


  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile =
    () => {

      setFile(null);

      setError("");
      setSuccess("");


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }

    };


  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize =
    (bytes) => {

      if (
        !bytes ||
        bytes <= 0
      ) {

        return "0 KB";

      }


      if (
        bytes < 1024
      ) {

        return `${bytes} B`;

      }


      if (
        bytes <
        1024 * 1024
      ) {

        return `${(
          bytes / 1024
        ).toFixed(1)} KB`;

      }


      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;

    };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setError("");
      setSuccess("");


      // -----------------------------------------------
      // VALIDATE FILE
      // -----------------------------------------------

      if (!file) {

        setError(
          "Please select a document."
        );

        return;

      }


      const validationError =
        validateFile(
          file
        );


      if (validationError) {

        setError(
          validationError
        );

        return;

      }


      // -----------------------------------------------
      // CHECK AUTHENTICATION
      // -----------------------------------------------

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");


      if (!token) {

        setError(
          "Your login session has expired. Please log in again."
        );

        return;

      }


      try {

        setUploading(true);


        // ---------------------------------------------
        // CREATE FORM DATA
        // ---------------------------------------------

        const formData =
          new FormData();


        /*
         * IMPORTANT:
         *
         * This MUST be called "document"
         * because your backend uses:
         *
         * upload.single("document")
         */

        formData.append(
          "document",
          file
        );


        formData.append(
          "name",
          name.trim() ||
          file.name
        );


        formData.append(
          "description",
          description.trim()
        );


        formData.append(
          "type",
          type
        );


        // ---------------------------------------------
        // UPLOAD
        // ---------------------------------------------

        const response =
          await api.post(
            "/documents",
            formData
          );


        console.log(
          "DOCUMENT UPLOADED:",
          response.data
        );


        setSuccess(
          "Document uploaded successfully."
        );


        // ---------------------------------------------
        // REDIRECT
        // ---------------------------------------------

        setTimeout(
          () => {

            navigate(
              "/documents"
            );

          },
          700
        );


      } catch (error) {

        console.error(
          "UPLOAD ERROR:",
          error
        );


        const status =
          error.response?.status;


        const serverMessage =
          error.response?.data?.message;


        if (
          status === 401
        ) {

          setError(
            "Your login session is invalid or expired. Please log in again."
          );

        } else if (
          status === 400
        ) {

          setError(
            serverMessage ||
            "Please select a valid document."
          );

        } else if (
          status === 413
        ) {

          setError(
            "The file is too large. Maximum size is 10 MB."
          );

        } else {

          setError(
            serverMessage ||
            "Unable to upload document. Please try again."
          );

        }

      } finally {

        setUploading(false);

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="documents-upload-page">

      <div className="documents-upload-card">


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="upload-back"
          onClick={() =>
            navigate(
              "/documents"
            )
          }
          disabled={uploading}
        >
          ← Back to Documents
        </button>


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="upload-heading">

          <span>
            📄
          </span>


          <div>

            <h1>
              Upload Document
            </h1>

            <p>
              Add an important business
              document to BusyBiz.
            </p>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="upload-error">

            <strong>
              Upload failed
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (

          <div className="upload-success">

            <strong>
              ✓
            </strong>

            <span>
              {success}
            </span>

          </div>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
        >


          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div className="upload-field">

            <label>
              Document File
            </label>


            <div
              className={`upload-drop-zone ${
                dragging
                  ? "upload-drop-zone-active"
                  : ""
              } ${
                file
                  ? "upload-drop-zone-selected"
                  : ""
              }`}
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
              onClick={() => {

                if (
                  !uploading &&
                  fileInputRef.current
                ) {

                  fileInputRef.current.click();

                }

              }}
            >

              <input
                ref={
                  fileInputRef
                }
                type="file"
                hidden
                disabled={
                  uploading
                }
                onChange={
                  handleFileChange
                }
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
              />


              {!file ? (

                <>

                  <div className="upload-drop-icon">
                    📤
                  </div>


                  <h3>
                    Drop your file here
                  </h3>


                  <p>
                    or click to browse
                  </p>


                  <small>
                    PDF, Word, Excel, JPG,
                    PNG, WebP or TXT
                    • Maximum 10 MB
                  </small>

                </>

              ) : (

                <div className="selected-file">

                  <div className="selected-file-icon">
                    📄
                  </div>


                  <div className="selected-file-info">

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        file.size
                      )}
                    </span>

                  </div>


                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={(event) => {

                      event.stopPropagation();

                      removeFile();

                    }}
                    disabled={
                      uploading
                    }
                  >
                    ×
                  </button>

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              DOCUMENT NAME
          ================================================= */}

          <div className="upload-field">

            <label>
              Document Name
            </label>


            <input
              type="text"
              placeholder="e.g. Supplier Agreement"
              value={name}
              disabled={
                uploading
              }
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />

          </div>


          {/* =================================================
              DOCUMENT TYPE
          ================================================= */}

          <div className="upload-field">

            <label>
              Document Type
            </label>


            <select
              value={type}
              disabled={
                uploading
              }
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
            >

              <option value="Document">
                Document
              </option>

              <option value="Invoice">
                Invoice
              </option>

              <option value="Receipt">
                Receipt
              </option>

              <option value="Quote">
                Quote
              </option>

              <option value="Contract">
                Contract
              </option>

              <option value="Report">
                Report
              </option>

              <option value="Spreadsheet">
                Spreadsheet
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="upload-field">

            <label>
              Description
            </label>


            <textarea
              placeholder="Optional description..."
              value={
                description
              }
              disabled={
                uploading
              }
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="upload-submit"
            disabled={
              uploading ||
              !file
            }
          >

            {uploading ? (

              <>
                <span className="upload-button-spinner">
                  ⟳
                </span>

                Uploading Document...
              </>

            ) : (

              <>
                📤 Upload Document
              </>

            )}

          </button>


        </form>

      </div>

    </div>

  );

}


export default DocumentsUpload;