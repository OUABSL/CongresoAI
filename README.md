# The AI Congress

## API Reference V1 for Congress AI System

This document outlines the API endpoints available in the Flask-React application, facilitating interaction with the system's functionalities.

### Authentication:

- JWT authentication is required for accessing most API endpoints.
- Users can obtain a JWT token by logging in with their credentials.

### User Management

| Route                                        | Method | Description                                                    | Request Body                                            | Response Code |
|----------------------------------------------|--------|----------------------------------------------------------------|-------------------------------------------------------|---------------|
| `/api/v1/login`                              | POST   | Initiates a login session for either a reviewer or an author.  | `rol` (string: "reviewer" or "author"), `username` (string), `password` (string) | 200 (success) |
| `/api/v1/signup`                             | POST   | Registers a new reviewer or author in the system.              | `rol` (string: "reviewer" or "author"), `username` (string - unique), `email` (string), `password` (string - hashed using bcrypt), `fullname` (string), `birthdate` (string - YYYY-MM-DD format), `phonenumber` (string), `knowledges` (list of strings, for reviewers), `interests` (list of strings, for authors) | 201 (created) |
| `/api/v1/logout`                             | POST   | Terminates the current user's session.                         | -                                                     | 200 (success) |
| `/api/v1/authors/profile/<username>`         | GET    | Retrieves the profile information of an author.                | -                                                     | 200 (success) |
| `/api/v1/authors/profile/<username>`         | PUT    | Edits the profile information of an author.                    | `username` (string - unique), `email` (string), `fullname` (string), `birthdate` (string - YYYY-MM-DD format), `phonenumber` (string), `interests` (list of strings) | 201 (created) |
| `/api/v1/reviewers/profile/<username>`       | GET    | Retrieves the profile information of a reviewer.               | -                                                     | 200 (success) |
| `/api/v1/reviewers/profile/<username>`       | PUT    | Edits the profile information of a reviewer.                   | `username` (string - unique), `email` (string), `fullname` (string), `birthdate` (string - YYYY-MM-DD format), `phonenumber` (string), `knowledges` (list of strings) | 201 (created) |

### Submission Management

| Route                                        | Method | Description                                                    | Request Body                                            | Response Code |
|----------------------------------------------|--------|----------------------------------------------------------------|-------------------------------------------------------|---------------|
| `/api/v1/submit`                             | POST   | Allows an authenticated author to upload a new manuscript.     | `latex_project` (file), `title` (string), `description` (string), `keywords` (list of strings) | 201 (created) |
| `/api/v1/submit/<author>`                    | GET    | Returns all manuscripts submitted by an authenticated author.  | -                                                     | 200 (success) |
| `/api/v1/submit/<author>/<article_title>`    | GET    | Returns details of a specific manuscript by an authenticated author. | -                                                     | 200 (success) |


**Administrator Endpoints**

The module focused on system administration implements the `admin` Blueprint and aims to manage system users, with plans to expand functionalities for complete control of all system features and key element configurations. Below are the implemented endpoints for the current version.

| URI (Method)                                   | Description                                                  | Process                                                                                  | Responses                                                                 |
|------------------------------------------------|--------------------------------------------------------------|------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `/api/v1/generate-register-token/<orcid>` (GET)| Generates a custom registration token for a reviewer using their ORCID. | Validates admin session, generates a unique token linked to the provided ORCID, returns a URL for the reviewer to complete registration. | 200 - Token generated with registration URL, 400 - Invalid ORCID, 403 - Access denied if not admin. |
| `/api/v1/verify-token/<token>` (GET)           | Verifies the validity of a registration token.               | Verifies if the provided token is valid, returns a message indicating token validity.    | 200 - Token valid, 400 - Token invalid or expired.                       |
| `/api/v1/admin/users` (GET)                    | Returns the list of all users (reviewers and authors) in the system. | Verifies admin authentication, retrieves and serializes all registered users' information. | 200 - Users list returned, 403 - Access denied if not admin.             |
| `/api/v1/admin/users` (POST)                   | Allows admin to register a new reviewer in the system.       | Verifies admin authentication, checks username availability, inserts new reviewer data.  | 201 - User registered, 400 - Username already exists, 403 - Access denied if not admin. |
| `/api/v1/admin/users/<username>` (PUT)         | Allows admin to update an existing reviewer's information.   | Verifies admin authentication, updates the reviewer's data in the database.              | 200 - User updated, 403 - Access denied if not admin.                    |
| `/api/v1/admin/users/<username>` (DELETE)      | Allows admin to delete a user from the system.               | Verifies admin authentication, deletes the user from the reviewers' database.            | 200 - User deleted, 403 - Access denied if not admin.                    |

**Additional Endpoints**

The system offers the download of usage manuals for each developed portal. Below are the implemented endpoints for this functionality.

| URI (Method)                                     | Description                                                | Process                                                                                   | Responses                                                                 |
|--------------------------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `/api/v1/manuales/manual-reviewer` (GET)         | Returns the reviewer's manual in PDF format for download.  | Returns the PDF file of the reviewer's manual from the specified server directory.        | 200 - Manual returned, 404 - File not found, 400 - Invalid file path.    |
| `/api/v1/manuales/manual-author` (GET)           | Returns the author's manual in PDF format for download.    | Returns the PDF file of the author's manual from the specified server directory.          | 200 - Manual returned, 404 - File not found, 400 - Invalid file path.    |
```

## Endpoint Details

### User Management Endpoints

#### `/api/v1/login` (POST)

**Request Body:**
- `rol` (string): "reviewer" or "author"
- `username` (string)
- `password` (string)

**Description:**
Allows users (authors and reviewers) to log into the system.

**Process:**
- Receives user credentials (rol, username, password).
- Verifies the user's existence in the corresponding database.
- Validates the password.
- Generates and returns an access token if the credentials are correct.

**Responses:**
- 200 - Successful login.
- 401 - Incorrect username or password.
- 404 - User not found.

#### `/api/v1/signup` (POST)

**Request Body:**
- `rol` (string): "reviewer" or "author"
- `username` (string - unique)
- `email` (string)
- `password` (string - hashed using bcrypt)
- `fullname` (string)
- `birthdate` (string - YYYY-MM-DD format)
- `phonenumber` (string)
- `knowledges` (list of strings, for reviewers)
- `interests` (list of strings, for authors)

**Description:**
Registers new users in the author and/or reviewer portal.

**Process:**
- Receives new user information.
- Checks the user's role and whether the user has dual roles.
- Verifies if the user is already registered in the corresponding portal.
- Validates the reviewer registration token if applicable.
- Creates a user model instance and saves it in the corresponding database.

**Responses:**
- 201 - Successful registration.
- 400 - User already exists.
- 401 - Unauthorized registration.

#### `/api/v1/logout` (POST)

**Description:**
Allows users to log out.

**Process:**
- Receives the logout request.
- Invalidates the user's access token.

**Responses:**
- 200 - Successful logout.

#### `/api/v1/authors/profile/<username>` (GET)

**Description:**
Returns the authenticated author's profile information.

**Process:**
- Receives the username.
- Verifies the authenticated user's identity.
- Retrieves and returns the profile data.

**Responses:**
- 200 - Successfully returned profile.
- 404 - User not found.

#### `/api/v1/authors/profile/<username>` (PUT)

**Request Body:**
- `username` (string - unique)
- `email` (string)
- `fullname` (string)
- `birthdate` (string - YYYY-MM-DD format)
- `phonenumber` (string)
- `interests` (list of strings)

**Description:**
Allows the authenticated author to update their profile information.

**Process:**
- Receives the username and data to be updated.
- Verifies the authenticated user's identity.
- Updates the profile data in the database.

**Responses:**
- 200 - Successfully updated profile.
- 403 - Unauthorized.

#### `/api/v1/reviewers/profile/<username>` (GET)

**Description:**
Returns the authenticated reviewer's profile information.

**Process:**
- Receives the username.
- Verifies the authenticated user's identity.
- Retrieves and returns the profile data.

**Responses:**
- 200 - Successfully returned profile.
- 404 - User not found.

#### `/api/v1/reviewers/profile/<username>` (PUT)

**Request Body:**
- `username` (string - unique)
- `email` (string)
- `fullname` (string)
- `birthdate` (string - YYYY-MM-DD format)
- `phonenumber` (string)
- `knowledges` (list of strings)

**Description:**
Allows the authenticated reviewer to update their profile information.

**Process:**
- Receives the username and data to be updated.
- Verifies the authenticated user's identity.
- Updates the profile data in the database.

**Responses:**
- 200 - Successfully updated profile.
- 403 - Unauthorized.

### Submission Management Endpoints

#### `/api/v1/submit` (POST)

**Request Body:**
- `latex_project` (file)
- `title` (string)
- `description` (string)
- `keywords` (list of strings)

**Description:**
Allows an authenticated author to upload a new manuscript along with its basic information and files.

**Process:**
- Validates the author's session.
- Verifies and processes the information received from the author.
- Stores the article in the database after validating its data.
- Initiates a thread for processing the manuscript and executing the corresponding services.

**Responses:**
- 201 - Article uploaded and in process.
- 400 - Manuscript with the same title already exists for the same author.
- 401 - Invalid session.
- 403 - Access denied if the user is not an author.

#### `/api/v1/submit/<author>` (GET)

**Description:**
Returns all manuscripts submitted by an authenticated author.

**Process:**
- Validates the user's session.
- Receives the author's username.
- Queries the database to obtain all manuscripts submitted by that author.
- Serializes and returns the main information of each article along with its review status.

**Responses:**
- 200 - Successfully returned the list of manuscripts.
- 401 - Invalid session.
- 404 - No manuscripts found for the specified author.

#### `/api/v1/submit/<author>/<article_title>` (GET)

**Description:**
Returns specific details of a manuscript submitted by an author.

**Process:**
- Validates the user's session.
- Receives the author's username and article title.
- Searches for the corresponding article in the database.
- Serializes and returns the detailed information of the article along with its review status.

**Responses:**
- 200 - Successfully returned article details.
- 401 - Invalid session.
- 404 - Article not found.

For any further information or assistance, please refer to the project's documentation or contact the development team.
