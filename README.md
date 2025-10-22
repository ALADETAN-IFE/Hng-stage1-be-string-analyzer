# HNG Internship - Backend Wizards Stage 1 (String Analyzer Service)

This is my submission for the **HNG Internship Stage 1 (Backend Wizards)** task.  
It’s a RESTful API service that analyzes strings and computes their properties — such as palindrome check, character frequency, hash value, and more.
Built using **Node.js**, **Express.js**, and **Crypto**.

---

## 🚀 Live API
[Live API Link on Railway](https://string-analyzer-hng-1.up.railway.app)

---

## 🧩 Features
- RESTful POST /strings endpoint to analyze and store strings
- GET /strings/{string_value} to retrieve specific string analysis
- GET /strings to fetch all analyzed strings with filters
- GET /strings/filter-by-natural-language for natural language query filtering
- DELETE /strings/{string_value} to remove a string
- Computes
- - Length of string
- - Palindrome check (case-insensitive)
- - Unique character count
- - Word count
- - SHA-256 hash (unique ID)
- - Character frequency map  
- Supports filtering via query parameters (palindrome, length, word count, etc.) 
- Handles natural language filters like: 
- - "all single word palindromic strings"
- - "strings longer than 10 characters"
- Proper error handling for invalid data, duplicates, and missing strings 
- Basic **rate limiting** to prevent abuse  
- **CORS enabled** for cross-origin access  
- Includes **structured logging** using `morgan`  

---

## 🧠 Technologies Used
- **Node.js** — Runtime environment  
- **Express.js** — Web framework  
- **Crypto** — For SHA-256 hashing  
- **Morgan** — Logging middleware  
- **dotenv** — Environment variable management  
- **express-rate-limit** — Rate limiting middleware  
- **CORS** — To enable cross-origin resource sharing  
- **nodemon** — To 

---

## 👤 About Me
**Aladetan Fortune Ifeloju (IfeCodes)**  
A passionate **Full Stack Developer** who enjoys building scalable and user-friendly web applications.  
I solve real-life problems with my projects and constantly strive to learn and improve.  

- 💻 [GitHub](https://github.com/ALADETAN-IFE)  
- 🐦 [Twitter](https://x.com/ifeCodes_)  
- 💼 [LinkedIn](https://www.linkedin.com/in/fortune-ife-aladetan-458ab136a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

---

## ⚙️ How to Run Locally

```bash
# Clone this repository
git clone https://github.com/ALADETAN-IFE/Hng-stage1-be-string-analyzer.git

# Navigate into the folder
cd hng-stage1-be-string-analyzer

# Install dependencies
npm install

# Create a .env file and add the following:
PORT=4176

# Start the server
npm start
