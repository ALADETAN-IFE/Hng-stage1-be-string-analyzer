
// REMOVED BY REPOGUARD: obfuscated malware alias
("express");
const {
  analyzeString,
  getAllStrings,
  getStringByValue,
  deleteString,
  filterByNaturalLanguage
} = require("../controllers/stringsController");

// REMOVED BY REPOGUARD: obfuscated malware alias
.Router();

router.post("/", analyzeString);
router.get("/", getAllStrings);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:value", getStringByValue);
router.delete("/:value", deleteString);

module.exports = router;
// REMOVED BY REPOGUARD: obfuscated malware payload
