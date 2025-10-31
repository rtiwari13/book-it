# Bookit: End-to-End Travel Experience Booking Application

Bookit is a fullstack web application that allows users to browse, select, and book travel experiences. This project is designed to showcase a complete end-to-end workflow, from a feature-rich frontend to a robust backend, demonstrating skills in API integration, state management, and clean UI design.

## Features

### Frontend
- **Browse Experiences**: A home page that lists all available travel experiences fetched from the backend.
- **View Details**: A details page for each experience, showing comprehensive information, including available dates and time slots.
- **Seamless Booking Flow**: A multi-step checkout process to collect user information and apply promotional codes.
- **Booking Confirmation**: A result page to confirm whether a booking was successful or if it failed.
- **Responsive Design**: A clean, mobile-friendly UI built with Tailwind CSS, ensuring a consistent user experience across all devices.
- **Clear User Feedback**: Provides clear loading, success, failure, and sold-out states to keep the user informed.

### Backend
- **RESTful API**: A well-structured API built with Node.js and Express to handle all application data.
- **Database Management**: Uses PostgreSQL with Prisma ORM for efficient and safe data handling.
- **Data Validation**: Ensures all incoming data is validated before being stored in the database.
- **Concurrency Control**: Prevents double-booking for the same time slot.
- **Promo Code Validation**: An endpoint to validate promotional codes and apply discounts.

## Tech Stack

| Category      | Technology                               |
|---------------|------------------------------------------|
| **Frontend**  | Next.js, React, TypeScript, Tailwind CSS |
| **Backend**   | Node.js, Express, TypeScript             |
| **Database**  | PostgreSQL, Prisma ORM                   |

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/rtiwari13/book-it
   cd bookit
   ```

2. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```sh
   cd ../backend
   npm install
   ```

4. **Set up environment variables:**
   - In the `backend` directory, create a `.env` file and add your PostgreSQL database URL:
     ```env
     DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
     ```

5. **Run database migrations:**
   - In the `backend` directory, apply the database schema:
     ```sh
     npx prisma db push
     ```

### Running the Application

1. **Start the backend server:**
   - From the `backend` directory:
     ```sh
     npm run dev
     ```
   - The backend will be running on `http://localhost:4000`.

2. **Start the frontend development server:**
   - From the `frontend` directory, create a `.env.local` file and add the following:
     ```env
     NEXT_PUBLIC_API_BASE="http://localhost:4000"
     ```
   - Now, run the development server:
     ```sh
     npm run dev
     ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint                | Description                                        |
|--------|-------------------------|----------------------------------------------------|
| `GET`  | `/experiences`          | Retrieves a list of all travel experiences.        |
| `GET`  | `/experiences/:id`      | Retrieves details and slot availability for one experience.|
| `POST` | `/bookings`             | Accepts and stores booking details.                |
| `GET`  | `/bookings/:id`         | Retrieves booking confirmation details.            |
| `POST` | `/promo/validate`       | Validates a promotional code.                      |

## Database Schema

The database is designed to manage experiences, time slots, bookings, and promotional codes. Below is an overview of the main tables:

### `Experience`
Stores the core details for each travel experience.
- `id`: Unique identifier
- `title`: Name of the experience
- `slug`: URL-friendly identifier
- `description`: Detailed description
- `priceCents`: Price in cents to avoid floating-point issues
- `imageUrl`, `location`: Additional metadata
- `slots`: A one-to-many relationship with the `Slot` model.

### `Slot`
Represents an available date and time for an experience.
- `id`: Unique identifier
- `experienceId`: Foreign key linking to the `Experience` table
- `slotDate`, `slotTime`: The date and time of the slot
- `capacity`: Maximum number of bookings
- `bookings`: A one-to-many relationship with the `Booking` model.
- A unique constraint on `experienceId`, `slotDate`, and `slotTime` prevents duplicate slots.

### `Booking`
Contains information for each booking made by a user.
- `id`: Unique identifier
- `slotId`: Foreign key linking to the `Slot` table
- `fullName`, `email`: User details
- `qty`: Number of tickets booked
- `subtotalCents`, `taxesCents`, `totalCents`: Pricing details
- `promoCode`: The promo code used, if any
- `refId`: A unique reference ID for the booking confirmation.

### `Promo`
Stores valid promotional codes.
- `code`: The promo code string (e.g., `SAVE10`)
- `type`: The type of discount (e.g., `percentage`, `flat`)
- `value`: The discount value
- `active`: Whether the promo code is currently active.

## Project Structure
```
/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (pages)/
│   │   └── components/
│   └── ...
└── backend/
    ├── src/
    │   ├── routes/
    │   ├── services/
    │   └── db/
    ├── prisma/
    └── ...
```
