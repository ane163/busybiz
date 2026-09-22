import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../../services/api";

import ProfileMenu from "../../components/dashboard/ProfileMenu";
import NotificationBell from "../../components/NotificationBell";

import "./Documents.css";


function Documents() {

  const navigate =
    useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [sortOrder, setSortOrder] =
    useState("newest");

  const [deletingId, setDeletingId] =
    useState(null);


  // =====================================================
  // LOAD DOCUMENTS
  // =====================================================

  const loadDocuments =
    async () => {

      try {

        setLoading(true);
        setError("");


        const response =
          await api.get(
            "/documents"
          );


        const loadedDocuments =
          response.data?.documents ||
          response.data ||
          [];


        setDocuments(
          Array.isArray(
            loadedDocuments
          )
            ? loadedDocuments
            : []
        );

      } catch (error) {

        console.error(
          "DOCUMENTS ERROR:",
          error
        );


        setError(
          error.response?.data?.message ||
          "Unable to load documents."
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadDocuments();

  }, []);


  // =====================================================
  // DOCUMENT TYPES
  // =====================================================

  const documentTypes =
    useMemo(() => {

      const types =
        documents
          .map(
            document =>
              document.type
          )
          .filter(Boolean);


      return [
        "All",
        ...Array.from(
          new Set(types)
        ).sort()
      ];

    }, [documents]);


  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredDocuments =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();


      let result =
        documents.filter(
          document => {

            const name =
              (
                document.name ||
                document.title ||
                document.originalName ||
                ""
              ).toLowerCase();


            const description =
              (
                document.description ||
                ""
              ).toLowerCase();


            const type =
              (
                document.type ||
                ""
              ).toLowerCase();


            const originalName =
              (
                document.originalName ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !searchTerm ||
              name.includes(
                searchTerm
              ) ||
              description.includes(
                searchTerm
              ) ||
              type.includes(
                searchTerm
              ) ||
              originalName.includes(
                searchTerm
              );


            const matchesType =
              typeFilter === "All" ||
              document.type ===
                typeFilter;


            return (
              matchesSearch &&
              matchesType
            );

          }
        );


      result.sort(
        (a, b) => {

          const dateA =
            new Date(
              a.createdAt ||
              a.updatedAt ||
              0
            ).getTime();


          const dateB =
            new Date(
              b.createdAt ||
              b.updatedAt ||
              0
            ).getTime();


          if (
            sortOrder ===
            "oldest"
          ) {

            return dateA - dateB;

          }


          if (
            sortOrder ===
            "name"
          ) {

            return (
              (
                a.name ||
                a.originalName ||
                ""
              ).localeCompare(
                b.name ||
                b.originalName ||
                ""
              )
            );

          }


          return dateB - dateA;

        }
      );


      return result;

    }, [
      documents,
      search,
      typeFilter,
      sortOrder
    ]);


  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDelete =
    async (id) => {

      if (!id) {
        return;
      }


      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this document?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeletingId(id);


        await api.delete(
          `/documents/${id}`
        );


        setDocuments(
          previous =>
            previous.filter(
              document =>
                document._id !== id
            )
        );

      } catch (error) {

        console.error(
          "DELETE DOCUMENT ERROR:",
          error
        );


        alert(
          error.response?.data?.message ||
          "Unable to delete document."
        );

      } finally {

        setDeletingId(null);

      }

    };


  // =====================================================
  // GET FILE URL
  // =====================================================

  const getFileUrl =
    (document) => {

      const fileUrl =
        document?.fileUrl ||
        document?.url ||
        document?.path;


      if (!fileUrl) {
        return null;
      }


      if (
        fileUrl.startsWith(
          "http://"
        ) ||
        fileUrl.startsWith(
          "https://"
        )
      ) {

        return fileUrl;

      }


      return `https://busybiz-5.onrender.com/${fileUrl}`;

    };


  // =====================================================
  // OPEN DOCUMENT
  // =====================================================

  const handleOpen =
    (document) => {

      const fileUrl =
        getFileUrl(
          document
        );


      if (!fileUrl) {

        alert(
          "No document file is available."
        );

        return;

      }


      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

    };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate =
    (date) => {

      if (!date) {
        return "—";
      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "—";

      }


      return parsedDate.toLocaleDateString(
        undefined,
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize =
    (bytes) => {

      const size =
        Number(bytes);


      if (
        !Number.isFinite(size) ||
        size <= 0
      ) {

        return "Unknown size";

      }


      if (
        size < 1024
      ) {

        return `${size} B`;

      }


      if (
        size < 1024 * 1024
      ) {

        return `${(
          size / 1024
        ).toFixed(1)} KB`;

      }


      if (
        size < 1024 * 1024 * 1024
      ) {

        return `${(
          size /
          (1024 * 1024)
        ).toFixed(1)} MB`;

      }


      return `${(
        size /
        (1024 * 1024 * 1024)
      ).toFixed(1)} GB`;

    };


  // =====================================================
  // FILE EXTENSION
  // =====================================================

  const getExtension =
    (document) => {

      const originalName =
        document?.originalName ||
        document?.fileName ||
        "";


      const parts =
        originalName.split(".");


      if (
        parts.length < 2
      ) {

        return "";

      }


      return parts
        .pop()
        .toUpperCase();

    };


  // =====================================================
  // IMAGE DETECTION
  // =====================================================

  const isImage =
    (document) => {

      if (
        document?.mimeType?.startsWith(
          "image/"
        )
      ) {

        return true;

      }


      const extension =
        getExtension(
          document
        );


      return [
        "JPG",
        "JPEG",
        "PNG",
        "WEBP"
      ].includes(
        extension
      );

    };


  // =====================================================
  // FILE ICON
  // =====================================================

  const getFileIcon =
    (document) => {

      const type =
        (
          document?.type ||
          ""
        ).toLowerCase();


      const extension =
        getExtension(
          document
        );


      if (
        type === "image" ||
        isImage(document)
      ) {

        return "🖼️";

      }


      if (
        type === "pdf" ||
        extension === "PDF"
      ) {

        return "📕";

      }


      if (
        type === "word" ||
        extension === "DOC" ||
        extension === "DOCX"
      ) {

        return "📘";

      }


      if (
        type === "spreadsheet" ||
        extension === "XLS" ||
        extension === "XLSX"
      ) {

        return "📗";

      }


      if (
        type === "text" ||
        extension === "TXT"
      ) {

        return "📄";

      }


      return "📁";

    };


  // =====================================================
  // DOCUMENT NAME
  // =====================================================

  const getDocumentName =
    (document) => {

      return (
        document?.name ||
        document?.title ||
        document?.originalName ||
        "Untitled Document"
      );

    };


  // =====================================================
  // IMAGE PREVIEW
  // =====================================================

  const renderPreview =
    (document) => {

      if (
        !isImage(document)
      ) {

        return (

          <div className="document-file-icon">

            {getFileIcon(
              document
            )}

          </div>

        );

      }


      const imageUrl =
        getFileUrl(
          document
        );


      if (!imageUrl) {

        return (

          <div className="document-file-icon">
            🖼️
          </div>

        );

      }


      return (

        <div className="document-image-preview">

          <img
            src={imageUrl}
            alt={
              getDocumentName(
                document
              )
            }
            onError={(event) => {

              event.currentTarget.style.display =
                "none";

            }}
          />

        </div>

      );

    };


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const clearFilters =
    () => {

      setSearch("");
      setTypeFilter("All");
      setSortOrder("newest");

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="documents-page">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="documents-navbar">

        <div className="documents-navbar-left">

          <button
            className="documents-back-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            ← Dashboard
          </button>


          <div className="documents-page-title">

            <span className="documents-title-icon">
              📄
            </span>


            <div>

              <h1>
                Documents
              </h1>

              <p>
                Manage your business documents
              </p>

            </div>

          </div>

        </div>


        <div className="documents-navbar-right">

          <NotificationBell />

          <ProfileMenu />

        </div>

      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="documents-content">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="documents-header">

          <div>

            <span className="documents-section-label">
              BUSINESS DOCUMENTS
            </span>


            <h2>
              Your Documents
            </h2>


            <p>
              Store, search and manage
              important business files.
            </p>

          </div>


          <button
            className="documents-upload-button"
            onClick={() =>
              navigate(
                "/documents/upload"
              )
            }
          >
            + Upload Document
          </button>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        {!loading &&
          !error && (

            <section className="documents-stats">

              <div className="document-stat-card">

                <div className="document-stat-icon">
                  📁
                </div>

                <div>

                  <span>
                    Total Documents
                  </span>

                  <strong>
                    {documents.length}
                  </strong>

                </div>

              </div>


              <div className="document-stat-card">

                <div className="document-stat-icon">
                  📄
                </div>

                <div>

                  <span>
                    Showing
                  </span>

                  <strong>
                    {filteredDocuments.length}
                  </strong>

                </div>

              </div>


              <div className="document-stat-card">

                <div className="document-stat-icon">
                  🖼️
                </div>

                <div>

                  <span>
                    Images
                  </span>

                  <strong>
                    {
                      documents.filter(
                        isImage
                      ).length
                    }
                  </strong>

                </div>

              </div>

            </section>

          )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="documents-error">

            <div>

              <strong>
                Unable to load documents
              </strong>

              <p>
                {error}
              </p>

            </div>


            <button
              onClick={
                loadDocuments
              }
              className="documents-retry-button"
            >
              Try Again
            </button>

          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="documents-loading">

            <div className="documents-loading-spinner">
              ⟳
            </div>

            <p>
              Loading documents...
            </p>

          </div>

        )}


        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        {!loading &&
          !error &&
          documents.length > 0 && (

            <section className="documents-controls">


              {/* SEARCH */}

              <div className="documents-search">

                <span>
                  🔎
                </span>


                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />


                {search && (

                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    title="Clear search"
                  >
                    ×
                  </button>

                )}

              </div>


              {/* TYPE */}

              <div className="documents-filter">

                <label>
                  Type
                </label>


                <select
                  value={
                    typeFilter
                  }
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                >

                  {documentTypes.map(
                    type => (

                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* SORT */}

              <div className="documents-filter">

                <label>
                  Sort
                </label>


                <select
                  value={
                    sortOrder
                  }
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value
                    )
                  }
                >

                  <option value="newest">
                    Newest
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>

                  <option value="name">
                    Name A-Z
                  </option>

                </select>

              </div>


              {/* CLEAR */}

              {(search ||
                typeFilter !== "All" ||
                sortOrder !== "newest") && (

                <button
                  className="documents-clear-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear
                </button>

              )}

            </section>

          )}


        {/* =================================================
            EMPTY DATABASE
        ================================================= */}

        {!loading &&
          !error &&
          documents.length === 0 && (

            <section className="documents-empty">

              <div className="documents-empty-icon">
                📁
              </div>


              <h3>
                No Documents Yet
              </h3>


              <p>
                Upload your first business
                document to start managing
                your files.
              </p>


              <button
                className="documents-empty-button"
                onClick={() =>
                  navigate(
                    "/documents/upload"
                  )
                }
              >
                Upload Your First Document
              </button>

            </section>

          )}


        {/* =================================================
            NO FILTER RESULTS
        ================================================= */}

        {!loading &&
          !error &&
          documents.length > 0 &&
          filteredDocuments.length === 0 && (

            <section className="documents-empty">

              <div className="documents-empty-icon">
                🔎
              </div>


              <h3>
                No Matching Documents
              </h3>


              <p>
                Try changing your search
                or filter settings.
              </p>


              <button
                className="documents-empty-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

            </section>

          )}


        {/* =================================================
            DOCUMENT GRID
        ================================================= */}

        {!loading &&
          !error &&
          filteredDocuments.length > 0 && (

            <section className="documents-grid">

              {filteredDocuments.map(
                document => (

                  <article
                    className="document-card"
                    key={
                      document._id
                    }
                  >


                    {/* CARD TOP */}

                    <div className="document-card-top">

                      {renderPreview(
                        document
                      )}


                      <div className="document-card-actions">

                        <button
                          className="document-menu-button"
                          onClick={() =>
                            handleDelete(
                              document._id
                            )
                          }
                          disabled={
                            deletingId ===
                            document._id
                          }
                          title="Delete document"
                        >
                          {deletingId ===
                          document._id
                            ? "..."
                            : "⋮"}
                        </button>

                      </div>

                    </div>


                    {/* CARD BODY */}

                    <div className="document-card-body">


                      <span className="document-type-badge">

                        {document.type ||
                          "Document"}

                      </span>


                      <h3
                        title={
                          getDocumentName(
                            document
                          )
                        }
                      >
                        {getDocumentName(
                          document
                        )}
                      </h3>


                      {document.description && (

                        <p className="document-description">

                          {document.description}

                        </p>

                      )}


                      <div className="document-meta">

                        <span>
                          📅{" "}
                          {formatDate(
                            document.createdAt
                          )}
                        </span>


                        <span>
                          💾{" "}
                          {formatFileSize(
                            document.size
                          )}
                        </span>

                      </div>


                      {document.originalName && (

                        <div className="document-original-name">

                          {document.originalName}

                        </div>

                      )}

                    </div>


                    {/* CARD FOOTER */}

                    <div className="document-card-footer">

                      <button
                        className="document-open-button"
                        onClick={() =>
                          handleOpen(
                            document
                          )
                        }
                      >
                        Open
                      </button>


                      <button
                        className="document-delete-button"
                        onClick={() =>
                          handleDelete(
                            document._id
                          )
                        }
                        disabled={
                          deletingId ===
                          document._id
                        }
                      >
                        {deletingId ===
                        document._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </article>

                )
              )}

            </section>

          )}

      </main>

    </div>

  );

}


export default Documents;
