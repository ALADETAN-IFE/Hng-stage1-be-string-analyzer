const express = require("express");
const {
  analyzeString,
  getAllStrings,
  getStringByValue,
  deleteString,
  filterByNaturalLanguage
} = require("../controllers/stringsController");

const router = express.Router();

router.post("/", analyzeString);
router.get("/", getAllStrings);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:value", getStringByValue);
router.delete("/:value", deleteString);

module.exports = router;
