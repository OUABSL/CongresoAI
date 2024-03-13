# CongresoAI

## API Reference V1 for Congress AI System

This document outlines the API endpoints available in the Flask-React application, facilitating interaction with the system's functionalities.

**Authentication:**

- JWT authentication is required for accessing most API endpoints.
- Users can obtain a JWT token by logging in with their credentials.

**User Management**

| Route                                            | Method | Description                                                    | Request Body                                            | Response Code |
|----------------------------------------------------|--------|----------------------------------------------------------------|-------------------------------------------------------|---------------|
| `/api/login`                                       | POST   | Initiates a login session for either a reviewer or an author. | `rol` (string: "reviewer" or "author"),                | 200 (success) |
|                                                    |        |                                                                | `username` (string),                                  |               |
|                                                    |        |                                                                | `password` (string)                                   |               |
|                                                    |        |                                                                |                                                       |               |
| `/api/signup`                                      | POST   | Registers a new reviewer or author in the system.              | `rol` (string: "reviewer" or "author"),               | 201 (created) |
|                                                    |        |                                                                | `username` (string - unique),                         |               |
|                                                    |        |                                                                | `email` (string),                     |               |
|                                                    |        |                                                                | `password` (string - hashed using bcrypt), |               |
|                                                    |        |                                                                | `fullname` (string),              |               |
|                                                    |        |                                                                | `birthdate` (string - YYYY-MM-DD format),             |               |
|                                                    |        |                                                                | `phonenumber` (string),                               |               |
|                                                    |        |                                                                | (For reviewer only) `knowledges` (list of strings)    |               |
|                                                    |        |                                                                | (For author only) `interests` (list of strings)       |               |
|                                                    |        |                                                                |                                                       |               |
| `/api/logout`                                      | POST   | Terminates the current user's session.                         | -                                                     | 200 (success) |
| `/api/authors/profile/<username>`                  | GET    | Retrieves the profile information of an author.                | -                                                     | 200 (success) |
| `/api/authors/profile/<username>`                  | PUT    | Edits     the profile information of a reviewer.               |                                                       | 201 (created) |
|                                                    |        |                                                                | `username` (string - unique),                         |               |
|                                                    |        |                                                                | `email` (string),                                     |               |
|                                                    |        |                                                                | `fullname` (string),                                  |               |
|                                                    |        |                                                                | `birthdate` (string - YYYY-MM-DD format),             |               |
|                                                    |        |                                                                | `phonenumber` (string),                               |               |
|                                                    |        |                                                                | `interests` (list of strings)                         |               |      
|                                                    |        |                                                                |                                                       |               |
| `/api/reviewers/profile/<username>`                | GET    | Retrieves the profile information of a reviewer.               | -                                                     | 200 (success) |
|                                                    |        |                                                                |                                                       |               |
|                                                    |        |                                                                |                                                       |               |
| `/api/reviewers/profile/<username>`                | PUT    | Edits     the profile information of a reviewer.               |                                                       | 201 (created) |
|                                                    |        |                                                                | `username` (string - unique),                         |               |
|                                                    |        |                                                                | `email` (string),                                     |               |
|                                                    |        |                                                                | `fullname` (string),                                  |               |
|                                                    |        |                                                                | `birthdate` (string - YYYY-MM-DD format),             |               |
|                                                    |        |                                                                | `phonenumber` (string),                               |               |
|                                                    |        |                                                                | `knowledges` (list of strings)                        |               |

**Article Management (Author)**

| Route                                  | Method | Description                                                       | Request Body                                                      | Response Code |
|-------------------------------------------|--------|----------------------------------------------------------------|-------------------------------------------------------------------|---------------|
| `/api/submit`                             | POST   | Uploads a new scientific article for evaluation.               | `title` (string), `description` (string), `key_words` (string     | 201 (created) |
|                                           |        |                                                                | - separated list), file object (ZIP containing LaTeX project)     |               |

**Article Evaluation (Reviewer)**

| Route                                                         | Method | Description                                                               | Request Body                                                  | Response Code |
|---------------------------------------------------------------|--------|---------------------------------------------------------------------------|-------------------------------------------------------------------|--------------|
| `/api/evaluate/<reviewer>`                                    | GET    | Retrieves a list of articles assigned to a specific reviewer for evaluation. | -                                                                 | 200 (success) |
|                                                               |        |                                                                             |                                                                  |
| `/api/evaluate/<reviewer>/<article_title>`                    | GET    | Obtains specific details of an assigned article.                            | -                                                                 | 200 (success) |
|                                                               |        |                                                                             |                                                                  |
| `/api/evaluate/<reviewer>/<article_title>`                    | POST   | Adds a review to the specified article.                                     | Review data (JSON object)                                       |201 (created) |
|                                                               |        |                                                                             |                                                                  |
| `/api/evaluate/<reviewer>/<article_title>`                   | PUT
