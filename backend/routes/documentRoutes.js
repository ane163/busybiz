const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Document = require("../models/Document");

const protect =
  require("../middleware/authMiddleware");

const {
  businessAccess
} =
  require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory =
  path.join(
    __dirname,
    "../uploads/documents"
  );


if (
  !fs.existsSync(uploadDirectory)
) {

  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  );

}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadDirectory
      );

    },


    filename: (
      req,
      file,
      cb
    ) => {

      const extension =
        path.extname(
          file.originalname
        );


      const baseName =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );


      const uniqueName =
        `${baseName}-${Date.now()}${extension}`;


      cb(
        null,
        uniqueName
      );

    }

  });


// =====================================================
// ALLOWED FILE TYPES
// =====================================================

const allowedTypes = [

  "application/pdf",

  "image/jpeg",

  "image/png",

  "image/webp",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain"

];


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter =
  (
    req,
    file,
    cb
  ) => {

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {

      cb(
        null,
        true
      );

    } else {

      cb(
        new Error(
          "This file type is not supported."
        ),
        false
      );

    }

  };


// =====================================================
// MULTER
// =====================================================

const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        10 * 1024 * 1024

    }

  });


// =====================================================
// GET ALL DOCUMENTS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,

  async (
    req,
    res
  ) => {

    try {

      const businessId =
        req.business?._id ||
        req.business?.id ||
        req.business;


      if (!businessId) {

        return res
          .status(400)
          .json({

            message:
              "Business information is missing."

          });

      }


      const documents =
        await Document.find({

          business:
            businessId

        })

          .populate(
            "uploadedBy",
            "fullName email"
          )

          .sort({
            createdAt: -1
          });


      return res
        .status(200)
        .json({

          documents

        });

    } catch (error) {

      console.error(
        "GET DOCUMENTS ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          message:
            error.message ||
            "Unable to load documents."

        });

    }

  }
);


// =====================================================
// UPLOAD DOCUMENT
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,

  upload.single(
    "document"
  ),

  async (
    req,
    res
  ) => {

    let uploadedFilePath = null;


    try {

      console.log(
        "===================================="
      );

      console.log(
        "DOCUMENT UPLOAD STARTED"
      );

      console.log(
        "USER:",
        req.user
      );

      console.log(
        "BUSINESS:",
        req.business
      );

      console.log(
        "BODY:",
        req.body
      );

      console.log(
        "FILE:",
        req.file
      );


      // =================================================
      // CHECK USER
      // =================================================

      const userId =
        req.user?._id ||
        req.user?.id ||
        req.user?.userId;


      if (!userId) {

        return res
          .status(401)
          .json({

            message:
              "Authenticated user could not be identified."

          });

      }


      // =================================================
      // CHECK BUSINESS
      // =================================================

      const businessId =
        req.business?._id ||
        req.business?.id ||
        req.business;


      if (!businessId) {

        return res
          .status(400)
          .json({

            message:
              "Business could not be identified."

          });

      }


      // =================================================
      // CHECK FILE
      // =================================================

      if (!req.file) {

        return res
          .status(400)
          .json({

            message:
              "Please select a document."

          });

      }


      uploadedFilePath =
        req.file.path;


      // =================================================
      // DOCUMENT INFORMATION
      // =================================================

      const documentName =
        (
          req.body?.name ||
          req.file.originalname
        ).trim();


      const documentDescription =
        (
          req.body?.description ||
          ""
        ).trim();


      const documentType =
        req.body?.type ||
        getDocumentType(
          req.file.mimetype
        );


      const fileUrl =
        `/uploads/documents/${req.file.filename}`;


      // =================================================
      // CREATE DOCUMENT
      // =================================================

      const document =
        await Document.create({

          business:
            businessId,

          uploadedBy:
            userId,

          name:
            documentName,

          originalName:
            req.file.originalname,

          description:
            documentDescription,

          type:
            documentType,

          mimeType:
            req.file.mimetype,

          size:
            req.file.size,

          fileName:
            req.file.filename,

          filePath:
            req.file.path,

          fileUrl:
            fileUrl

        });


      console.log(
        "DOCUMENT CREATED:",
        document._id
      );


      console.log(
        "DOCUMENT UPLOAD SUCCESS"
      );

      console.log(
        "===================================="
      );


      return res
        .status(201)
        .json({

          message:
            "Document uploaded successfully.",

          document

        });

    } catch (error) {

      console.error(
        "===================================="
      );

      console.error(
        "UPLOAD DOCUMENT ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "ERROR MESSAGE:",
        error.message
      );

      console.error(
        "ERROR NAME:",
        error.name
      );

      console.error(
        "ERROR STACK:",
        error.stack
      );

      console.error(
        "===================================="
      );


      // =================================================
      // DELETE FILE IF DATABASE CREATION FAILED
      // =================================================

      if (
        uploadedFilePath &&
        fs.existsSync(
          uploadedFilePath
        )
      ) {

        try {

          fs.unlinkSync(
            uploadedFilePath
          );

        } catch (deleteError) {

          console.error(
            "FAILED TO DELETE UPLOADED FILE:",
            deleteError
          );

        }

      }


      return res
        .status(500)
        .json({

          message:
            error.message ||
            "Unable to upload document."

        });

    }

  }
);


// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,

  async (
    req,
    res
  ) => {

    try {

      const businessId =
        req.business?._id ||
        req.business?.id ||
        req.business;


      const document =
        await Document.findOne({

          _id:
            req.params.id,

          business:
            businessId

        })

          .populate(
            "uploadedBy",
            "fullName email"
          );


      if (!document) {

        return res
          .status(404)
          .json({

            message:
              "Document not found."

          });

      }


      return res
        .status(200)
        .json({

          document

        });

    } catch (error) {

      console.error(
        "GET DOCUMENT ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          message:
            error.message ||
            "Unable to load document."

        });

    }

  }
);


// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,

  async (
    req,
    res
  ) => {

    try {

      const businessId =
        req.business?._id ||
        req.business?.id ||
        req.business;


      const document =
        await Document.findOne({

          _id:
            req.params.id,

          business:
            businessId

        });


      if (!document) {

        return res
          .status(404)
          .json({

            message:
              "Document not found."

          });

      }


      // =================================================
      // DELETE PHYSICAL FILE
      // =================================================

      if (
        document.filePath &&
        fs.existsSync(
          document.filePath
        )
      ) {

        fs.unlinkSync(
          document.filePath
        );

      }


      await Document.deleteOne({

        _id:
          document._id

      });


      return res
        .status(200)
        .json({

          message:
            "Document deleted successfully."

        });

    } catch (error) {

      console.error(
        "DELETE DOCUMENT ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          message:
            error.message ||
            "Unable to delete document."

        });

    }

  }
);


// =====================================================
// DOCUMENT TYPE
// =====================================================

function getDocumentType(
  mimeType
) {

  if (
    mimeType ===
    "application/pdf"
  ) {

    return "PDF";

  }


  if (
    mimeType.startsWith(
      "image/"
    )
  ) {

    return "Image";

  }


  if (
    mimeType.includes(
      "word"
    )
  ) {

    return "Word";

  }


  if (
    mimeType.includes(
      "excel"
    ) ||
    mimeType.includes(
      "spreadsheet"
    )
  ) {

    return "Spreadsheet";

  }


  if (
    mimeType ===
    "text/plain"
  ) {

    return "Text";

  }


  return "Document";

}


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "DOCUMENT MULTER ERROR:",
      error
    );


    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {

        return res
          .status(400)
          .json({

            message:
              "File is too large. Maximum size is 10 MB."

          });

      }


      return res
        .status(400)
        .json({

          message:
            error.message

        });

    }


    if (
      error
    ) {

      return res
        .status(400)
        .json({

          message:
            error.message ||
            "Unable to process uploaded file."

        });

    }


    next();

  }
);


module.exports = router;