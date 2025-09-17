# Asset Management API Documentation

This document provides a comprehensive overview of this RESTful API for the Asset Management System. It includes details on all available endpoints, their required data structures, and examples of successful and unsuccessful responses.

## Table of Contents
1.  [API Endpoints](#api-endpoints)
    - [1.1 Authentication](#11-authentication)
    - [1.2 Users](#12-users)
    - [1.3 Assets](#13-assets)
    - [1.4 Departments](#14-departments)
    - [1.5 Other Endpoints](#15-other-endpoints)
2.  [Mock Data for Testing](#mock-data-for-testing)

---

## API Endpoints

The base URL for all endpoints is `http://your-server-address/api`.

### 1.1 Authentication (`/api/auth`)

-   **`POST /register`**
    -   **Description:** Registers a new user account.
    -   **Authentication:** Public.
    -   **Request Body:**
        ```json
        {
          "first_name": "Fredrick",
          "middle_name": "",
          "last_name": "Mbugua",
          "email": "fmbugua@jiranismart.com",
          "password": "2025@Jirani",
          "role_id": 1,
          "role": "Admin",
          "department_id": 1
        }
        ```
    -   **Success Response:** `HTTP 201 Created`
        ```json
        {
          "success": true,
          "message": "User registered successfully",
          "data": {
            "id": 1,
            "first_name": "Fredrick",
            "middle_name": "",
            "last_name": "Mbugua",
            "email": "fmbugua@jiranismart.com",
            "role_id": 1,
            "role": "Admin",
            "department_id": 1
          }
        }
        ```
    -   **Error Response:** `HTTP 400 Bad Request`
        ```json
        {
          "success": false,
          "message": "duplicate key value violates unique constraint \"users_email_key\""
        }
        ```

-   **`POST /login`**
    -   **Description:** Authenticates a user and returns an access token and refresh token in cookies.
    -   **Authentication:** Public.
    -   **Request Body:**
        ```json
        {
          "email": "fmbugua@jiranismart.com",
          "password": "2025@Jirani"
        }
        ```
    -   **Success Response:** `HTTP 200 OK`
        ```json
        {
          "success": true,
          "message": "Logged in successfully",
          "data": {
            "accessToken": "ey...",
            "refreshToken": "ey...",
            "user": {
                "id": 1,
                "email": "fmbugua@jiranismart.com",
                "role": "Admin"
            }
          }
        }
        ```
    -   **Error Response:** `HTTP 401 Unauthorized`
        ```json
        {
          "success": false,
          "message": "Invalid credentials"
        }
        ```

-   **`POST /refresh`**
    -   **Description:** Refreshes an expired access token using the refresh token from cookies.
    -   **Authentication:** Public (via cookie).
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 401 Unauthorized`

-   **`POST /logout`**
    -   **Description:** Clears the access and refresh token cookies.
    -   **Authentication:** Public (but token is cleared).
    -   **Success Response:** `HTTP 200 OK`

### 1.2 Users (`/api/users`)

-   **`POST /`**
    -   **Description:** Creates a new user.
    -   **Authentication:** Requires Access Token (Admin/Super Admin role).
    -   **Request Body:** Same as `auth/register`.
    -   **Success Response:** `HTTP 201 Created`
    -   **Error Response:** `HTTP 400 Bad Request`

-   **`GET /`**
    -   **Description:** Retrieves a list of all users.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 500 Internal Server Error`

-   **`GET /:id`**
    -   **Description:** Retrieves a user by their ID.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`PUT /:id`**
    -   **Description:** Updates a user's details.
    -   **Authentication:** Requires Access Token.
    -   **Request Body:** (Partial data)
        ```json
        {
          "first_name": "Fredrick Brian"
        }
        ```
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`DELETE /:id`**
    -   **Description:** Deletes a user.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

### 1.3 Assets (`/api/assets`)

-   **`POST /`**
    -   **Description:** Creates a new asset.
    -   **Authentication:** Requires Access Token.
    -   **Request Body:**
        ```json
        {
          "asset_tag": "SER-001",
          "serial_number": "SN-12345-ABC",
          "description": "Dell PowerEdge T30 Server",
          "purchase_date": "2024-03-20",
          "purchase_price": 2500.00
        }
        ```
    -   **Success Response:** `HTTP 201 Created`

-   **`GET /`**
    -   **Description:** Retrieves all assets.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`

-   **`GET /:id`**
    -   **Description:** Retrieves an asset by ID.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`PUT /:id`**
    -   **Description:** Updates an asset.
    -   **Authentication:** Requires Access Token.
    -   **Request Body:**
        ```json
        {
          "description": "Lenovo ThinkPad X1 Carbon Gen 10"
        }
        ```
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`DELETE /:id`**
    -   **Description:** Deletes an asset.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

### 1.4 Departments (`/api/departments`)

-   **`POST /`**
    -   **Description:** Creates a new department.
    -   **Authentication:** Requires Access Token.
    -   **Request Body:**
        ```json
        {
          "name": "Customer Support"
        }
        ```
    -   **Success Response:** `HTTP 201 Created`
    -   **Error Response:** `HTTP 400 Bad Request`

-   **`GET /`**
    -   **Description:** Retrieves all departments.
    -   **Authentication:** Public.
    -   **Success Response:** `HTTP 200 OK`

-   **`GET /:id`**
    -   **Description:** Retrieves a department by ID.
    -   **Authentication:** Public.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`PUT /:id`**
    -   **Description:** Updates a department.
    -   **Authentication:** Requires Access Token.
    -   **Request Body:**
        ```json
        {
          "name": "ICT & Security"
        }
        ```
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

-   **`DELETE /:id`**
    -   **Description:** Deletes a department.
    -   **Authentication:** Requires Access Token.
    -   **Success Response:** `HTTP 200 OK`
    -   **Error Response:** `HTTP 404 Not Found`

### 1.5 Other Endpoints
Endpoints for `Employees`, `Assignments`, and `Expenses` follow the same RESTful conventions for `GET`, `POST`, `PUT`, and `DELETE` requests as described above.

---

## Mock Data for Testing

Use this mock data to test these API endpoints.

### **Register User**
```json
// POST /api/auth/register
{
  "first_name": "Fredrick",
  "middle_name": "",
  "last_name": "Mbugua",
  "email": "fmbugua@jiranismart.com",
  "password": "2025@Jirani",
  "role_id": 1,
  "role": "Admin",
  "department_id": 1
}