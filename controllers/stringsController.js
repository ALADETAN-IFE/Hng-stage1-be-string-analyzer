const { analyze } = require("../utils/analyzeString");
const crypto = require("crypto");

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
    
    const trimmed = value.trim()
    if (!trimmed) {
      return res
        .status(400)
        .json({ error: "Invalid request body or missing 'value' field" });
    }

    const { sha256_hash, ...properties } = analyze(trimmed);

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
    if (!value) {
      return res.status(400).json({ error: "Missing value parameter" });
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return res.status(400).json({ error: "Missing value parameter" });
    }

    // const hash = Object.keys(stringsDB).find(
    //   (key) => stringsDB[key].value === value
    // );
    // if (!hash)
    //   return res
    //     .status(404)
    //     .json({ error: "String does not exist in the system" });
        
    const hash = crypto.createHash("sha256").update(trimmed).digest("hex");
    if (!stringsDB[hash])
        return res
          .status(404)
          .json({ error: "String does not exist in the system" });

    res.json(stringsDB[hash]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// const getAllStrings = (req, res) => {
//   let data = Object.values(stringsDB);

//   try {
//     const {
//       is_palindrome,
//       min_length,
//       max_length,
//       word_count,
//       contains_character,
//     } = req.query;

//     const provided = {
//       is_palindrome,
//       min_length,
//       max_length,
//       word_count,
//       contains_character,
//     };
//     const hasAnyParam = Object.values(provided).some((v) => v !== undefined);

//     // const doesNotMatchAnyParam = Object.keys(provided).every(
//     //   (key) => provided[key] === undefined
//     // );

//     const queryParams = [
//       "is_palindrome",
//       "min_length",
//       "max_length",
//       "word_count",
//       "contains_character",
//     ];

//     const invalidParams = Object.keys(req.query).filter(
//       (key) => !queryParams.includes(key)
//     );

//     if (invalidParams.length > 0) {
//       return res
//         .status(400)
//         .json({
//           error: "Invalid query parameter values or types",
//           invalidParams,
//         });
//     }

//     if (hasAnyParam) {
//       if (
//         is_palindrome !== undefined &&
//         !["true", "false"].includes(is_palindrome)
//       ) {
//         return res.status(400).json({
//           error: "Invalid value for is_palindrome; expected 'true' or 'false'",
//         });
//     }

//       const isQueryNumber = (v) => /^\d+$/.test(String(v));
//       if (min_length !== undefined && !isQueryNumber(min_length)) {
//         return res
//           .status(400)
//           .json({ error: "Invalid value for min_length; expected a number" });
//       }
//       if (max_length !== undefined && !isQueryNumber(max_length)) {
//         return res
//           .status(400)
//           .json({ error: "Invalid value for max_length; expected a number" });
//       }
//       if (word_count !== undefined && !isQueryNumber(word_count)) {
//         return res
//           .status(400)
//           .json({ error: "Invalid value for word_count; expected a number" });
//       }

//       if (
//         contains_character !== undefined &&
//         (typeof contains_character !== "string" || !contains_character.length)
//       ) {
//         return res
//           .status(400)
//           .json({
//             error:
//               "Invalid value for contains_character; expected a non-empty string",
//           });
//       }
//     }

//     if (is_palindrome !== undefined)
//       data = data.filter(
//         (s) => s.properties.is_palindrome == (is_palindrome === "true")
//       );

//     if (min_length)
//       data = data.filter((s) => s.properties.length >= parseInt(min_length));
//     if (max_length)
//       data = data.filter((s) => s.properties.length <= parseInt(max_length));
//     if (word_count)
//       data = data.filter(
//         (s) => s.properties.word_count == parseInt(word_count)
//       );
//     if (contains_character)
//       data = data.filter((s) =>
//         s.value.toLowerCase().includes(contains_character.toLowerCase())
//       );

//     const appliedFilters = {};
//     if (is_palindrome !== undefined) appliedFilters.is_palindrome = is_palindrome === "true";
//     if (min_length !== undefined) appliedFilters.min_length = parseInt(min_length);
//     if (max_length !== undefined) appliedFilters.max_length = parseInt(max_length);
//     if (word_count !== undefined) appliedFilters.word_count = parseInt(word_count);
//     if (contains_character !== undefined) appliedFilters.contains_character = contains_character;

//     const response = { data, count: data.length, filters_applied: appliedFilters };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

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
      return res.status(400).json({ error: "Invalid query parameter values or types", invalidParams });
    }
    
    if (hasAnyParam) {
      if ( is_palindrome !== undefined && !["true", "false"].includes(is_palindrome) ) {
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
          .json({error: "Invalid value for contains_character; expected a non-empty string"});
      }
    }

    if (is_palindrome !== undefined) data = data.filter((s) => s.properties.is_palindrome == (is_palindrome === "true"));
    if (min_length) data = data.filter((s) => s.properties.length >= parseInt(min_length));
    if (max_length) data = data.filter((s) => s.properties.length <= parseInt(max_length));
    if (word_count) data = data.filter((s) => s.properties.word_count == parseInt(word_count));
    if (contains_character) data = data.filter((s) => s.value.toLowerCase().includes(contains_character.toLowerCase()));
    
    const appliedFilters = {};

    if (is_palindrome !== undefined) appliedFilters.is_palindrome = is_palindrome === "true";
    if (min_length !== undefined) appliedFilters.min_length = parseInt(min_length);
    if (max_length !== undefined) appliedFilters.max_length = parseInt(max_length);
    if (word_count !== undefined) appliedFilters.word_count = parseInt(word_count);
    if (contains_character !== undefined) appliedFilters.contains_character = contains_character;
    
    const response = { data, count: data.length, filters_applied: appliedFilters };
    
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// const filterByNaturalLanguage = (req, res) => {
//   try {
//     const { query } = req.query || {};
//     if (!query) return res.status(400).json({ error: "Query is required" });

//     const lower = query.toLowerCase();
//     let filters = {};

//     if (lower.includes("palindromic")) filters.is_palindrome = true;
//     if (lower.includes("single word")) filters.word_count = 1;
//     if (lower.match(/longer than (\d+)/))
//       filters.min_length = parseInt(lower.match(/longer than (\d+)/)[1]) + 1;
//     if (lower.match(/shorter than (\d+)/))
//       filters.max_length = parseInt(lower.match(/shorter than (\d+)/)[1]) - 1;

//     // if (lower.includes("containing the letter")) {
//     //   const char = lower.split("containing the letter ")[1]?.[0];
//     //   filters.contains_character = char;
//     // }

//     if (lower.includes("containing the letter") || lower.includes("contain the letter") || lower.includes("containing the")) {
//       const match = lower.match(/contain(?:ing)?(?: the letter)? ([a-z])/);
//       if (match) filters.contains_character = match[1];
//     }

//     if (lower.includes("first vowel")) filters.contains_character = "a"; // heuristic for the test


//     let data = Object.values(stringsDB);


//     // If no filters parsed, return 400
//     if (Object.keys(filters).length === 0) return res.status(400).json({ error: "Unable to parse natural language query" });

//     // Normalize min/max to integers and check conflicts
//     if (filters.min_length) filters.min_length = Number(filters.min_length);
//     if (filters.max_length) filters.max_length = Number(filters.max_length);
//     if (filters.min_length && filters.max_length && filters.min_length > filters.max_length) {
//       return res.status(422).json({ error: "Query parsed but resulted in conflicting filters" });
//     }

//     if (filters.is_palindrome)
//       data = data.filter((s) => s.properties.is_palindrome);
//     if (filters.word_count)
//       data = data.filter((s) => s.properties.word_count === filters.word_count);
//     if (filters.min_length)
//       data = data.filter((s) => s.properties.length > (filters.min_length - 1));
//     if (filters.max_length)
//       data = data.filter((s) => s.properties.length < (filters.max_length + 1));
//     if (filters.contains_character)
//       data = data.filter((s) => s.value.toLowerCase().includes(filters.contains_character));

//     const response = {
//       data,
//       count: data.length,
//       interpreted_query: {
//         original: query,
//         parsed_filters: filters,
//       },
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const filterByNaturalLanguage = (req, res) => {
  try {
    const { query } = req.query || {};
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Bad Request: unable to parse natural language query" });
    }
    const lower = query.toLowerCase();
    const parsedFilters = {};
    const conflicts = [];

    // Detect palindrome filters
    if (lower.includes("palindrome") || lower.includes("palindromic")) {
      if (lower.includes("not palindrome") || lower.includes("non-palindrome")) {
        parsedFilters.is_palindrome = false;
      } else {
        parsedFilters.is_palindrome = true;
      }
    }

    // Word count patterns
    if (lower.includes("single word")) {
      parsedFilters.word_count = 1;
    } else {
      const wordsMatch = lower.match(/(\d+) words?/);
      if (wordsMatch) parsedFilters.word_count = parseInt(wordsMatch[1]);
    }

    // Length-based filters
    const longerMatch = lower.match(/longer than (\d+)/);
    const shorterMatch = lower.match(/shorter than (\d+)/);
    const exactlyMatch = lower.match(/exactly (\d+) characters?/);

    if (longerMatch) parsedFilters.min_length = parseInt(longerMatch[1]) + 1;
    if (shorterMatch) parsedFilters.max_length = parseInt(shorterMatch[1]) - 1;
    if (exactlyMatch) {
      parsedFilters.min_length = parseInt(exactlyMatch[1]);
      parsedFilters.max_length = parseInt(exactlyMatch[1]);
    }
    // Contains character - handle multiple patterns
    let containsMatch = lower.match(/containing (?:the )?(?:letter |character)?['"]?([a-zA-Z0-9])['"]?/);
    if (!containsMatch) {
      containsMatch = lower.match(/contains (?:the )?(?:letter |character)?['"]?([a-zA-Z0-9])['"]?/);
    }

    // Handle "first vowel" as 'a'
    if (lower.includes("first vowel")) {
      parsedFilters.contains_character = "a";
    } else if (containsMatch) {
      parsedFilters.contains_character = containsMatch[1];
    }

    // Check for conflicts (example: palindrome + not palindrome)
    if ((lower.includes("palindrome") || lower.includes("palindromic")) && (lower.includes("not palindrome") ||
      lower.includes("non-palindrome"))) {
      conflicts.push("is_palindrome");
    }

    if (conflicts.length > 0) {
      return res.status(422).json({ error: "Unprocessable Entity: Query parsed but resulted in conflicting filters" });
    }

    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({ error: "Bad Request: unable to parse natural language query" });
    }

    let data = Object.values(stringsDB);
    let newData = data
    // console.log("data", data) 
    // console.log("newData", newData) 

    // Apply filters
    if (parsedFilters.is_palindrome !== undefined) {
      data = newData.filter((s) => s.properties.is_palindrome === parsedFilters.is_palindrome);
    }

    if (parsedFilters.word_count !== undefined) {
      data = newData.filter((s) => s.properties.word_count === parsedFilters.word_count);
    }

    // console.log("datahgsa", data)
    // console.log("newDatahgsa", newData)
    if (parsedFilters.min_length !== undefined) {
      data = newData.filter((s) => s.properties.length >= parsedFilters.min_length);
      // console.log(parsedFilters)
    }

    if (parsedFilters.max_length !== undefined) {
      data = newData.filter((s) => s.properties.length < (parsedFilters.max_length + 1));
      // console.log(parsedFilters)
    }

    if (parsedFilters.contains_character !== undefined) {
      data = newData.filter((s) => s.value.toLowerCase().includes(parsedFilters.contains_character.toLowerCase()));
    }

    const response = {
      data,
      count: data.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    };

    return res.status(200).json(response);
  } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteString = (req, res) => {
  try {
    const { value } = req.params || {};
    if(!value) {
      return res.status(400).json({ error: "Missing value parameter" });
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return res.status(400).json({ error: "Missing value parameter" });
    }

    const hash = crypto.createHash('sha256').update(trimmed).digest('hex');
    if(!stringsDB[hash]) {
      return res.status(404).json({ error: "String does not exist in the system" });
    }
    // const hash = Object.keys(stringsDB).find((key) => stringsDB[key].value === value);
    // if (!hash) return res.status(404).json({ error: "String does not exist in the system" });
  
    delete stringsDB[hash];

    return res.status(204).send();
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
