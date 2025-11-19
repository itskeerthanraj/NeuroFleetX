# NeuroFleetX Backend - Complete Setup Guide

## ✅ What Was Created

A fully functional Spring Boot + MongoDB backend for your NeuroFleetX fleet management system.

### Project Structure
```
backend/
├── pom.xml                                          # Maven configuration
├── README.md                                        # Backend documentation
├── src/main/java/com/neurofleetx/
│   ├── NeuroFleetXApplication.java                 # Main Spring Boot app
│   ├── model/
│   │   ├── User.java                               # User model (admin/dispatcher/driver)
│   │   ├── Driver.java                             # Driver model
│   │   ├── Vehicle.java                            # Vehicle model
│   │   ├── Trip.java                               # Trip model
│   │   └── Location.java                           # Location embedded model
│   ├── repository/
│   │   ├── UserRepository.java                     # MongoDB user queries
│   │   ├── DriverRepository.java                   # MongoDB driver queries
│   │   ├── VehicleRepository.java                  # MongoDB vehicle queries
│   │   └── TripRepository.java                     # MongoDB trip queries
│   ├── controller/
│   │   ├── AuthController.java                     # Login & token verify
│   │   ├── DriverController.java                   # Driver CRUD + location
│   │   ├── VehicleController.java                  # Vehicle CRUD + location
│   │   └── TripController.java                     # Trip CRUD + assignment/optimize
│   ├── security/
│   │   ├── JwtUtil.java                            # JWT token creation/validation
│   │   ├── JwtFilter.java                          # Bearer token auth filter
│   │   └── SecurityConfig.java                     # Spring Security configuration
│   └── data/
│       └── DataLoader.java                         # Seeds demo data on startup
├── src/main/resources/
│   └── application.properties                      # MongoDB & JWT settings
```

### API Endpoints Implemented

#### Authentication
- `POST /api/auth/login` - Login with email/password → returns JWT token + user info
- `GET /api/auth/verify` - Verify token (returns user info from token)

#### Drivers
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/available` - List drivers with AVAILABLE status
- `GET /api/drivers/{id}` - Get driver by ID
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/{id}` - Update driver
- `DELETE /api/drivers/{id}` - Delete driver
- `PUT /api/drivers/{id}/location` - Update driver location

#### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/available` - List vehicles with AVAILABLE status
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `GET /api/vehicles/driver/{driverId}` - Get vehicles for a driver
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `PUT /api/vehicles/{id}/location` - Update vehicle location

#### Trips
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create trip (status: REQUESTED)
- `GET /api/trips/driver/{driverId}` - Get trips for driver
- `PUT /api/trips/{id}/assign?driverId=X&vehicleId=Y` - Assign driver + vehicle
- `POST /api/trips/{id}/optimize` - Auto-assign (simple: picks first available)
- `PUT /api/trips/{id}/start` - Start trip (status: IN_PROGRESS)
- `PUT /api/trips/{id}/complete` - Complete trip & free driver/vehicle
- `PUT /api/trips/{id}/cancel` - Cancel trip

### Demo Data Seeded on Startup

**Users:**
- admin@neurofleetx.com / admin123 (ROLE: ADMIN)
- dispatcher@neurofleetx.com / dispatcher123 (ROLE: DISPATCHER)
- driver@neurofleetx.com / driver123 (ROLE: DRIVER)

**Drivers:**
- John Doe (driver1@example.com)
- Jane Smith (driver2@example.com)

**Vehicles:**
- ABC-123 (Toyota Camry 2019 SEDAN)
- XYZ-789 (Honda Civic 2020 SEDAN)

**Trips:**
- 1 sample trip in REQUESTED status

## 🚀 How to Run

### Prerequisites
- Java 17+ (project uses JDK 24 on your machine)
- Maven 3.9.x (✓ installed on your machine)
- MongoDB running on localhost:27017 (✓ verified running)

### Start the Backend

```powershell
cd "c:\Users\nimis\OneDrive\Documents\K\INFOSYS\new\frontend\frontend\backend"
mvn spring-boot:run
```

Expected output:
```
[INFO] BUILD SUCCESS
Tomcat started on port(s): 8080
Started NeuroFleetXApplication
```

The backend will be available at: `http://localhost:8080`

### Test Endpoints (PowerShell examples)

**1. Login:**
```powershell
$body = '{"email":"admin@neurofleetx.com","password":"admin123"}'
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method Post `
  -ContentType "application/json" -Body $body -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

**2. Verify Token:**
```powershell
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/verify" -Method Get `
  -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content
```

**3. Get All Drivers:**
```powershell
$headers = @{"Authorization" = "Bearer $token"}
$drivers = Invoke-WebRequest -Uri "http://localhost:8080/api/drivers" -Method Get `
  -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$drivers | Format-Table firstName, lastName, status
```

**4. Create a Vehicle:**
```powershell
$body = '{"licensePlate":"NEW-100","make":"Ford","model":"Focus","year":2023,"color":"Blue","type":"SEDAN","status":"AVAILABLE"}'
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:8080/api/vehicles" -Method Post `
  -ContentType "application/json" -Body $body -Headers $headers -UseBasicParsing
```

## 🔧 Configuration

### MongoDB Connection
Edit `application.properties`:
```properties
spring.data.mongodb.database=neurofleetx
spring.data.mongodb.port=27017
spring.data.mongodb.host=localhost
```

### JWT Secret (Important for Production!)
```properties
jwt.secret=ReplaceThisWithASecretKeyForDevOnly
jwt.expiration-ms=86400000  # 24 hours
```

⚠️ **Before deploying to production:**
- Change `jwt.secret` to a strong random string
- Use environment variable: `JWT_SECRET`
- Update `SecurityConfig` to read from env

## 📋 Frontend Integration

### Fixed Issue
✅ Updated `src/contexts/AuthContext.js` to save user to localStorage in `login()` method:
```javascript
localStorage.setItem('user', JSON.stringify(userData));
```

This ensures the Login component can read the user role and redirect correctly.

### Expected Frontend Login Flow
1. User enters email/password → frontend calls POST /api/auth/login
2. Backend returns {token, id, email, firstName, lastName, role}
3. Frontend stores token in localStorage + sets Authorization header
4. Frontend stores user object in localStorage for routing logic
5. On page refresh, AuthContext calls GET /api/auth/verify with token
6. User stays logged in ✅

## 🛡️ Security Notes

- **JWT Bearer Token:** All protected endpoints require `Authorization: Bearer <token>` header
- **CSRF Disabled:** API endpoints are stateless; CSRF not needed for REST APIs
- **CORS Enabled:** @CrossOrigin on all controllers allows frontend requests
- **Password Encoding:** BCrypt with 10 rounds (default strength)
- **Role-Based Access:** Currently permissive; can add @PreAuthorize("ROLE_ADMIN") to endpoints

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `netstat -ano | Select-String "27017"`
- Check port 8080 is free: `netstat -ano | Select-String ":8080"`
- Check logs for exceptions

### 403 Forbidden on login
- Verify content-type is `application/json`
- Check request body format: `{"email":"...","password":"..."}`
- Ensure no CORS proxy is interfering

### No data seeded
- Check MongoDB `neurofleetx` database exists
- Verify DataLoader runs on startup (logs should show collections created)
- Manually seed: run SQL scripts or POST to endpoints

## 📦 Build & Package

```powershell
# Build without running
mvn clean package -DskipTests

# Output: backend/target/neurofleetx-backend-0.0.1-SNAPSHOT.jar
# Can be deployed to any Java app server
```

## ✨ Next Steps (Optional)

1. **Docker Container** - Add Dockerfile + docker-compose for one-command setup
2. **Refresh Tokens** - Implement JWT refresh token rotation for security
3. **Rate Limiting** - Add Spring Security rate limiting to prevent abuse
4. **Swagger/OpenAPI** - Add springdoc-openapi for interactive API docs
5. **Logging** - Structured logging with SLF4J + Logback
6. **Tests** - Add unit tests for controllers and services
7. **Error Handling** - Custom @ControllerAdvice for consistent error responses

---

**Created:** 2025-11-12  
**Status:** ✅ Fully functional, ready for frontend integration
