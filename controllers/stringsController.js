const { analyze } = require("../utils/analyzeString");

let stringsDB = {};

const analyzeString = (req, res) => {
  try {
    const { value } = req.body || {};
    if (!value) {
      return res
        .status(400)
        .json({ error: "Invalid request body or missing 'value' field" });
    }

    if (typeof value !== "string") {
      return res
        .status(422)
        .json({ error: "Invalid data type for 'value'(must be a string)" });
    }

    if (!value.trim()) {
      return res
        .status(400)
        .json({ error: "Invalid request body or missing 'value' field" });
    }

    const { sha256_hash, ...properties } = analyze(value);

    if (stringsDB[sha256_hash]) {
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    const record = {
      id: sha256_hash,
      value,
      properties: { ...properties, sha256_hash },
      created_at: new Date().toISOString(),
    };

    stringsDB[sha256_hash] = record;
    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStringByValue = (req, res) => {
  const { value } = req.params || {};
  try {
    if (!value || !value.trim()) {
      return res.status(400).json({ error: "Missing value parameter" });
    }
    const hash = Object.keys(stringsDB).find(
      (key) => stringsDB[key].value === value
    );
    if (!hash)
      return res
        .status(404)
        .json({ error: "String does not exist in the system" });
    res.json(stringsDB[hash]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllStrings = (req, res) => {
  let data = Object.values(stringsDB);

  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    const provided = {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    };
    const hasAnyParam = Object.values(provided).some((v) => v !== undefined);

    const doesNotMatchAnyParam = Object.keys(provided).every(
      (key) => provided[key] === undefined
    );

    const queryParams = [
      "is_palindrome",
      "min_length",
      "max_length",
      "word_count",
      "contains_character",
    ];
    const invalidParams = Object.keys(req.query).filter(
      (key) => !queryParams.includes(key)
    );

    if (invalidParams.length > 0) {
      return res
        .status(400)
        .json({
          error: "Invalid query parameter values or types",
          invalidParams,
        });
    }

    if (hasAnyParam) {
      if (
        is_palindrome !== undefined &&
        !["true", "false"].includes(is_palindrome)
      ) {
        return res.status(400).json({
          error: "Invalid value for is_palindrome; expected 'true' or 'false'",
        });
      }

      const isQueryNumber = (v) => /^\d+$/.test(String(v));
      if (min_length !== undefined && !isQueryNumber(min_length)) {
        return res
          .status(400)
          .json({ error: "Invalid value for min_length; expected a number" });
      }
      if (max_length !== undefined && !isQueryNumber(max_length)) {
        return res
          .status(400)
          .json({ error: "Invalid value for max_length; expected a number" });
      }
      if (word_count !== undefined && !isQueryNumber(word_count)) {
        return res
          .status(400)
          .json({ error: "Invalid value for word_count; expected a number" });
      }

      if (
        contains_character !== undefined &&
        (typeof contains_character !== "string" || !contains_character.length)
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid value for contains_character; expected a non-empty string",
          });
      }
    }

    if (is_palindrome !== undefined)
      data = data.filter(
        (s) => s.properties.is_palindrome == (is_palindrome === "true")
      );

    if (min_length)
      data = data.filter((s) => s.properties.length >= parseInt(min_length));
    if (max_length)
      data = data.filter((s) => s.properties.length <= parseInt(max_length));
    if (word_count)
      data = data.filter(
        (s) => s.properties.word_count == parseInt(word_count)
      );
    if (contains_character)
      data = data.filter((s) =>
        s.value.toLowerCase().includes(contains_character.toLowerCase())
      );

    const response = { data, count: data.length, filters_applied: req.query };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterByNaturalLanguage = (req, res) => {
  try {
    const { query } = req.query || {};
    if (!query) return res.status(400).json({ error: "Query is required" });

    const lower = query.toLowerCase();
    let filters = {};

    if (lower.includes("palindromic")) filters.is_palindrome = true;
    if (lower.includes("single word")) filters.word_count = 1;
    if (lower.match(/longer than (\d+)/))
      filters.min_length = parseInt(lower.match(/longer than (\d+)/)[1]) + 1;
    if (lower.match(/shorter than (\d+)/))
      filters.max_length = parseInt(lower.match(/shorter than (\d+)/)[1]) - 1;
    if (lower.includes("containing the letter")) {
      const char = lower.split("containing the letter ")[1]?.[0];
      filters.contains_character = char;
    }

    let data = Object.values(stringsDB);

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({ error: "Unable to parse natural language query" });
    }

    // Validate for conflicting filters: min_length > max_length
    if (
      filters.min_length &&
      filters.max_length &&
      filters.min_length > filters.max_length
    ) {
      return res.status(422).json({ error: "Query parsed but resulted in conflicting filters" });
    }

    if (filters.is_palindrome)
      data = data.filter((s) => s.properties.is_palindrome);
    if (filters.word_count)
      data = data.filter((s) => s.properties.word_count === filters.word_count);
    if (filters.min_length)
      data = data.filter((s) => s.properties.length > filters.min_length - 1);
    if (filters.max_length)
      data = data.filter((s) => s.properties.length < filters.max_length + 1);
    if (filters.contains_character)
      data = data.filter((s) => s.value.toLowerCase().includes(filters.contains_character));

    const response = {
      data,
      count: data.length,
      interpreted_query: {
        original: query,
        parsed_filters: filters,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteString = (req, res) => {
  try {
    const { value } = req.params || {};
    const hash = Object.keys(stringsDB).find(
      (key) => stringsDB[key].value === value
    );
    if (!hash) return res.status(404).json({ error: "String not found" });
  
    delete stringsDB[hash];
    res.status(204).end();
    
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" }); 
  }
};

module.exports = {
  analyzeString,
  getStringByValue,
  getAllStrings,
  deleteString,
  filterByNaturalLanguage,
};
