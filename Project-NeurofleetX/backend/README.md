NeuroFleetX Backend

Spring Boot + MongoDB backend that supports the NeuroFleetX frontend demo.

How to run

- Install Java 17+ and Maven.
- Make sure MongoDB is running on localhost:27017 or update application.properties.
- From this `backend` folder run:

  mvn spring-boot:run

Default seeded demo accounts:

- admin@neurofleetx.com / admin123  (ROLE: ADMIN)
- dispatcher@neurofleetx.com / dispatcher123 (ROLE: DISPATCHER)
- driver@neurofleetx.com / driver123 (ROLE: DRIVER)

API base path: /api
