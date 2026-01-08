# Asset Management API Documentation

This document provides a comprehensive overview of the RESTful API for the Asset Management System, reflecting all recent modifications to the database schema and application logic. The base URL for all endpoints is assumed to be `http://server-address/api`.

All API responses follow a standard JSON format:

* **Successful Response:** `{"success": true, "message": "...", "data": {...}}`
* **Unsuccessful Response:** `{"success": false, "message": "..."}`


## 1. Authentication (`/api/auth`)

### `POST /register`

* **Description:** Creates a new employee record and a corresponding user account in a single transaction.
* **Authentication:** Public.
* **Request Body:**

    ```json
    {
      "first_name": "Fredrick",
      "middle_name": "",
      "last_name": "Mbugua",
      "email": "fmbugua@jiranismart.com",
      "password": "2025@Jirani",
      "phone": "+254740790088",
      "role_id": 1,
      "department_id": 1,
      "branch_id": 1
    }
    ```
* **Success Response:** `HTTP 201 Created`
* **Error Response:** `HTTP 400 Bad Request` (e.g., "A user with this email already exists.")

### `POST /login`

* **Description:** Authenticates a user and returns an access token.
* **Authentication:** Public.
* **Request Body:**

    ```json
    {
      "email": "fmbugua@jiranismart.com",
      "password": "2025@Jirani"
    }
    ```
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 401 Unauthorized`

### `POST /logout`

* **Description:** Clears the authentication tokens.
* **Authentication:** Public.
* **Success Response:** `HTTP 200 OK`

---

## 2. Users (`/api/users`)

### `GET /`

* **Description:** Retrieves a list of all users.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`

### `GET /:id`

* **Description:** Retrieves a user by their ID.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `PUT /:id`

* **Description:** Updates a user's details.
* **Authentication:** Requires Access Token.
* **Request Body:** (Partial data)

    ```json
    {
      "middle_name": "Brian"
    }
    ```
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `DELETE /:id`

* **Description:** Deletes a user.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

---

## 3. Assets (`/api/assets`)

### `POST /`

* **Description:** Creates a new asset.
* **Authentication:** Requires Access Token.
* **Request Body:**

    ```json
    {
        "asset_tag": "LPT-RTR-004",
        "asset_type": "Laptop",
        "manufacturer": "Huawei",
        "model": "Huawei Lap",
        "serial_number": "L-B-345678",
        "status": "In Stock",
        "location": "Wote Branch",
        "purchase_date": "2024-03-10",
        "purchase_price": 40000.00,
        "notes": "Replacement laptop."
    }
    ```
* **Success Response:** `HTTP 201 Created`

### `GET /`

* **Description:** Retrieves all assets.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`

### `GET /:id`

* **Description:** Retrieves an asset by ID.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `PUT /:id`

* **Description:** Updates an asset.
* **Authentication:** Requires Access Token.
* **Request Body:**

    ```json
    {
      "description": "Lenovo ThinkPad X1 Carbon Gen 10",
      "purchase_price": 1650.00
    }
    ```
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `DELETE /:id`

* **Description:** Deletes an asset.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

---

## 4. Departments (`/api/departments`)

### `POST /`

* **Description:** Creates a new department.
* **Authentication:** Requires Access Token.
* **Request Body:**

    ```json
    {
      "name": "ICT Operations"
    }
    ```
* **Success Response:** `HTTP 201 Created`

### `GET /`

* **Description:** Retrieves all departments.
* **Authentication:** Public.
* **Success Response:** `HTTP 200 OK`

### `GET /:id`

* **Description:** Retrieves a department by ID.
* **Authentication:** Public.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `PUT /:id`

* **Description:** Updates a department.
* **Authentication:** Requires Access Token.
* **Request Body:**

    ```json
    {
      "name": "ICT & Security"
    }
    ```
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

### `DELETE /:id`

* **Description:** Deletes a department.
* **Authentication:** Requires Access Token.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`

---

## 5. Branches (`/api/branches`)

### `POST /`

* **Description:** Creates a new branch.
* **Authentication:** Requires Access Token.
* **Request Body:**

    ```json
    {
      "name": "Headquarters",
      "location": "Mwatate"
    }
    ```
* **Success Response:** `HTTP 201 Created`

### `GET /`

* **Description:** Retrieves all branches.
* **Authentication:** Public.
* **Success Response:** `HTTP 200 OK`

### `GET /:id`

* **Description:** Retrieves a branch by ID.
* **Authentication:** Public.
* **Success Response:** `HTTP 200 OK`
* **Error Response:** `HTTP 404 Not Found`