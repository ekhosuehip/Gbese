# Gbese

## **Technologies Used**
- **Express.js** for building the API.
- **MongoDB** for storing notes and user data.
- **Mongoose** for object modeling and schema definition.
- **TypeScript** for type safety and better maintainability.
- **Redis** for temporary storage.
- **JWT** for user authentication.
- **Joi** for validation.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ekhosuehip/Gbese.git
   cd Gbese
   ```

2. Push to the repository:

   ```bash
   git status
   git add .
   git commit -m "commit message"
   git checkout -b name_branch # only the first time you are pushing
   git push origin HEAD
   ```

3. Pull from the repository:

   ```bash
   git pull origin main
   ```

## API Endpoints

### Health Check

- `GET /api/health` — A simple endpoint to check if the server is running.

### 📲 Phone Number OTP Flow

1. Receive OTP:
- `POST /api/v1/phone/register` -
Request Body
   ```bash
   {
      "phone": "2348012345678"
   }
   ```

2. Verify OTP:
- `POST /api/v1/phone/verify` -
Request Body
   ```bash
   {
      "otp": "otp received",
      "key": "key_received_after_otp"
   }
   ```


