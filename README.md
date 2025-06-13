# StayFinder API Documentation

## Project Overview

**Project Name**: StayFinder  
**Description**: A full-stack web application inspired by Airbnb, enabling users to search, view, and book short-term stays; hosts to list and manage properties with images; and admins to oversee users, listings, and bookings.

### Objectives
- Provide a robust, scalable RESTful API for a short-term rental platform.
- Support role-based access control for users, hosts, and admins.
- Enable secure authentication, image uploads, and booking management.
- Ensure seamless integration for frontend developers.

### Tech Stack
- **Frontend**: React (MERN stack, not covered here but designed for integration).
- **Backend**: Node.js + Express.
- **Database**: MongoDB with Mongoose ORM.
- **Authentication**: JSON Web Tokens (JWT).
- **Image Uploads**: Cloudinary + Multer for file uploads.
- **Architecture**: RESTful API with feature-based routing (auth, listings, bookings, admin).

### User Roles & Permissions
| Role  | Permissions |
|-------|-------------|
| **User** | Register, log in, browse listings, book stays. |
| **Host** | All user permissions + create, update, and delete own listings with image uploads. |
| **Admin** | All host permissions + manage users, listings, bookings, and promote users to hosts. |

## API Endpoints

The StayFinder API is organized into four main route groups: **Authentication**, **Listings**, **Bookings**, and **Admin**. All endpoints follow RESTful conventions and return JSON responses. Protected routes require a valid JWT token in the `Authorization: Bearer <JWT>` header.

### Base URL
```
https://api.stayfinder.com
```

### 1. Authentication Routes (`/api/auth`)

#### POST `/register`
**Description**: Register a new user or host.  
**Access**: Public  
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourPassword123",
  "role": "user" // or "host"
}
```
- `name`: String, required (min 2 characters).
- `email`: String, required, valid email format.
- `password`: String, required (min 6 characters).
- `role`: String, optional (defaults to "user"; can be "user" or "host").

**Response**:
- **201 Created**:
  ```json
  {
    "user": {
      "_id": "1234567890abcdef",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Email already exists"
  }
  ```
- **422 Unprocessable Entity**:
  ```json
  {
    "message": "Invalid input data",
    "errors": ["Password must be at least 6 characters"]
  }
  ```

**Notes**:
- Passwords are hashed using bcrypt before storage.
- The response excludes the password for security.

#### POST `/login`
**Description**: Authenticate a user and return a JWT token.  
**Access**: Public  
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "yourPassword123"
}
```
- `email`: String, required.
- `password`: String, required.

**Response**:
- **200 OK**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "1234567890abcdef",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

**Notes**:
- The JWT token must be included in the `Authorization: Bearer <token>` header for protected routes.
- Tokens are valid for a configurable duration (e.g., 1 hour) and can be refreshed if needed.

### 2. Listings Routes (`/api/listings`)

#### GET `/`
**Description**: Fetch all listings with optional filters.  
**Access**: Public  
**Query Parameters**:
- `location`: String, optional (e.g., "New York").
- `minPrice`: Number, optional (e.g., 50).
- `maxPrice`: Number, optional (e.g., 200).

**Example**:
```
GET /api/listings?location=New%20York&minPrice=50&maxPrice=200
```

**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "1234567890abcdef",
      "title": "Cozy Apartment in NYC",
      "description": "A lovely 1-bedroom apartment...",
      "location": "New York",
      "price": 100,
      "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
      "host": "1234567890abcdef",
      "createdAt": "2025-06-14T00:16:00Z"
    },
    ...
  ]
  ```

**Notes**:
- Filters are case-insensitive for `location`.
- Listings are paginated (default: 10 per page, configurable via `page` and `limit` query params).

#### GET `/:id`
**Description**: Fetch a single listing by its ID.  
**Access**: Public  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Response**:
- **200 OK**:
  ```json
  {
    "_id": "1234567890abcdef",
    "title": "Cozy Apartment in NYC",
    "description": "A lovely 1-bedroom apartment...",
    "location": "New York",
    "price": 100,
    "images": ["https://cloudinary.com/image1.jpg"],
    "host": "1234567890abcdef"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "Listing not found"
  }
  ```

#### POST `/`
**Description**: Create a new listing (host only).  
**Access**: Protected (role: host)  
**Request**: `multipart/form-data`  
**Fields**:
- `title`: String, required (e.g., "Cozy Apartment").
- `description`: String, required.
- `location`: String, required.
- `price`: Number, required (e.g., 100).
- `images[]`: File array, optional (image files for upload).

**Example**:
```http
POST /api/listings
Authorization: Bearer <JWT>
Content-Type: multipart/form-data

title=Cozy Apartment
description=A lovely 1-bedroom apartment
location=New York
price=100
images[]=image1.jpg
images[]=image2.jpg
```

**Response**:
- **201 Created**:
  ```json
  {
    "_id": "1234567890abcdef",
    "title": "Cozy Apartment",
    "description": "A lovely 1-bedroom apartment",
    "location": "New York",
    "price": 100,
    "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
    "host": "1234567890abcdef"
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Host access required"
  }
  ```
- **422 Unprocessable Entity**:
  ```json
  {
    "message": "Invalid input data",
    "errors": ["Title is required"]
  }
  ```

**Notes**:
- Images are uploaded to Cloudinary via Multer.
- Maximum of 5 images per listing (configurable).
- The `host` field is automatically set to the authenticated user’s ID.

#### GET `/host/my-listings`
**Description**: Fetch all listings created by the logged-in host.  
**Access**: Protected (role: host)  
**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "1234567890abcdef",
      "title": "Cozy Apartment",
      "location": "New York",
      "price": 100,
      "images": ["https://cloudinary.com/image1.jpg"]
    },
    ...
  ]
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Host access required"
  }
  ```

#### PUT `/:id`
**Description**: Update a listing (host only, must own the listing).  
**Access**: Protected (role: host)  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Request**: `multipart/form-data`  
**Fields**:
- `title`: String, optional.
- `description`: String, optional.
- `location`: String, optional.
- `price`: Number, optional.
- `images[]`: File array, optional (to add new images).

**Response**:
- **200 OK**:
  ```json
  {
    "_id": "1234567890abcdef",
    "title": "Updated Apartment",
    "description": "Updated description",
    "location": "New York",
    "price": 120,
    "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/new-image.jpg"]
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "You are not authorized to update this listing"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "Listing not found"
  }
  ```

**Notes**:
- Only the host who created the listing can update it.
- New images are appended to existing ones (up to the maximum limit).

#### DELETE `/:id`
**Description**: Delete a listing and its associated images (host only, must own the listing).  
**Access**: Protected (role: host)  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Response**:
- **200 OK**:
  ```json
  {
    "message": "Listing deleted successfully"
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "You are not authorized to delete this listing"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "Listing not found"
  }
  ```

**Notes**:
- Deletes the listing from MongoDB and associated images from Cloudinary.
- Triggers cleanup to ensure no orphaned images remain.

### 3. Bookings Routes (`/api/bookings`)

#### POST `/`
**Description**: Book a listing (user only).  
**Access**: Protected (role: user)  
**Request Body**:
```json
{
  "listingId": "1234567890abcdef",
  "checkIn": "2025-07-01",
  "checkOut": "2025-07-05"
}
```
- `listingId`: String, required (MongoDB ObjectId).
- `checkIn`: String, required (ISO date, e.g., "YYYY-MM-DD").
- `checkOut`: String, required (ISO date, must be after `checkIn`).

**Response**:
- **201 Created**:
  ```json
  {
    "_id": "abcdef1234567890",
    "listingId": "1234567890abcdef",
    "userId": "user1234567890",
    "checkIn": "2025-07-01T00:00:00Z",
    "checkOut": "2025-07-05T00:00:00Z",
    "status": "confirmed"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Date conflict: Listing is already booked for these dates"
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "User access required"
  }
  ```

**Notes**:
- Validates that the listing exists and is not booked for the requested dates.
- Stores the booking with references to the user and listing.

#### GET `/me`
**Description**: Fetch all bookings made by the authenticated user.  
**Access**: Protected (role: user)  
**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "abcdef1234567890",
      "listingId": "1234567890abcdef",
      "listingTitle": "Cozy Apartment",
      "checkIn": "2025-07-01T00:00:00Z",
      "checkOut": "2025-07-05T00:00:00Z",
      "status": "confirmed"
    },
    ...
  ]
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "User access required"
  }
  ```

**Notes**:
- Populates the `listingTitle` for easier frontend display.
- Bookings are sorted by `checkIn` date (descending).

### 4. Admin Routes (`/api/admin`)

All admin routes require JWT authentication with the `admin` role.

#### GET `/users`
**Description**: Fetch all users (admin only).  
**Access**: Protected (role: admin)  
**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "1234567890abcdef",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    ...
  ]
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Admin access required"
  }
  ```

#### GET `/listings`
**Description**: Fetch all listings (admin only).  
**Access**: Protected (role: admin)  
**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "1234567890abcdef",
      "title": "Cozy Apartment",
      "location": "New York",
      "price": 100,
      "host": "user1234567890"
    },
    ...
  ]
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Admin access required"
  }
  ```

#### GET `/bookings`
**Description**: Fetch all bookings (admin only).  
**Access**: Protected (role: admin)  
**Response**:
- **200 OK**:
  ```json
  [
    {
      "_id": "abcdef1234567890",
      "listingId": "1234567890abcdef",
      "userId": "user1234567890",
      "checkIn": "2025-07-01T00:00:00Z",
      "checkOut": "2025-07-05T00:00:00Z"
    },
    ...
  ]
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Admin access required"
  }
  ```

#### DELETE `/users/:id`
**Description**: Delete a user by ID (admin only).  
**Access**: Protected (role: admin)  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Response**:
- **200 OK**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "User not found"
  }
  ```

**Notes**:
- Deleting a user also removes their bookings and, if they are a host, their listings.

#### DELETE `/listings/:id`
**Description**: Delete a listing and its associated images (admin only).  
**Access**: Protected (role: admin)  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Response**:
- **200 OK**:
  ```json
  {
    "message": "Listing deleted successfully"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "Listing not found"
  }
  ```

**Notes**:
- Removes the listing and its images from Cloudinary.
- Cancels any associated bookings.

#### PUT `/users/:id/promote`
**Description**: Promote a user to the host role (admin only).  
**Access**: Protected (role: admin)  
**Parameters**:
- `id`: String, required (MongoDB ObjectId).

**Request Body**: None  
**Response**:
- **200 OK**:
  ```json
  {
    "_id": "1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "host"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "message": "User not found"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "User is already a host"
  }
  ```

## Core Features and Implementation Notes

### 1. Authentication & Authorization
- **JWT-Based Authentication**: Tokens are issued on login and validated via middleware for protected routes. Tokens include user ID and role.
- **Role-Based Access Control**: Middleware checks the user’s role (`user`, `host`, or `admin`) before allowing access to restricted endpoints.
- **Security**: Passwords are hashed using bcrypt. JWTs are signed with a secret key and have a configurable expiry (e.g., 1 hour).

### 2. Listings Management
- **Image Uploads**: Handled via Multer for file processing and Cloudinary for storage. Supports multiple images per listing (max 5, configurable).
- **Filtering**: Listings can be filtered by `location` (case-insensitive) and `price` range. Pagination is supported via `page` and `limit` query parameters.
- **Cleanup**: Deleting a listing removes associated images from Cloudinary to prevent orphaned files.

### 3. Booking System
- **Date Conflict Checking**: Prevents double bookings by validating that the requested `checkIn` and `checkOut` dates do not overlap with existing bookings.
- **User-Specific Bookings**: Users can view their bookings, with the `listingTitle` populated for convenience.
- **References**: Bookings store references to both the user and listing for efficient querying.

### 4. Admin Dashboard
- **Full Control**: Admins have CRUD access to users, listings, and bookings.
- **User Promotion**: Admins can promote users to hosts, enabling them to create listings.
- **Moderation**: Admins can remove malicious users or listings, with cascading deletes for associated bookings and images.

## Example: Connecting from the Frontend

### Authentication
- **Login Example** (using `fetch`):
  ```javascript
  const login = async (email, password) => {
    const response = await fetch('https://api.stayfinder.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token); // Store JWT
      return data.user;
    }
    throw new Error(data.message);
  };
  ```

- **Protected Route Example**:
  ```javascript
  const fetchMyListings = async () => {
    const response = await fetch('https://api.stayfinder.com/api/listings/host/my-listings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message);
  };
  ```

### Image Uploads
- Use `multipart/form-data` for endpoints like `POST /api/listings` and `PUT /api/listings/:id`.
- Example using `FormData`:
  ```javascript
  const createListing = async (listingData, imageFiles) => {
    const formData = new FormData();
    formData.append('title', listingData.title);
    formData.append('description', listingData.description);
    formData.append('location', listingData.location);
    formData.append('price', listingData.price);
    imageFiles.forEach(file => formData.append('images[]', file));

    const response = await fetch('https://api.stayfinder.com/api/listings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message);
  };
  ```

### Error Handling
- All endpoints return standard HTTP status codes (e.g., `200`, `400`, `401`, `404`).
- Error responses include a `message` field for frontend display.
- Example:
  ```json
  {
    "message": "Invalid input data",
    "errors": ["Price must be a positive number"]
  }
  ```

## Next Steps for Frontend Developers

1. **Integrate Authentication**:
   - Store JWT tokens securely (e.g., in `localStorage` or HTTP-only cookies).
   - Include the `Authorization: Bearer <JWT>` header in all requests to protected routes.

2. **Handle Image Uploads**:
   - Use `FormData` for endpoints that accept `multipart/form-data`.
   - Display uploaded images using the Cloudinary URLs returned in responses.

3. **Implement Listing Filters**:
   - Use query parameters like `location`, `minPrice`, and `maxPrice` to filter listings.
   - Support pagination with `page` and `limit` parameters.

4. **Display Bookings**:
   - Fetch user bookings via `GET /api/bookings/me` and display `listingTitle` for clarity.
   - Validate date inputs on the frontend to match the `YYYY-MM-DD` format.

5. **Error Handling**:
   - Parse the `message` field from error responses and display user-friendly messages.
   - Handle `401 Unauthorized` by redirecting to the login page.

6. **Admin Dashboard**:
   - Build admin-only views for managing users, listings, and bookings.
   - Implement role-based UI rendering based on the user’s `role` from the login response.

## Additional Resources

- **Postman Collection**: Available upon request for testing all endpoints.
- **Sample Payloads**: Example request/response JSON is available in the backend codebase.
- **Backend Codebase**: Refer to the `/routes` directory for route implementations and middleware logic.
