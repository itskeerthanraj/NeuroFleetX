package com.neurofleetx.data;

import java.time.Instant;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.neurofleetx.model.Driver;
import com.neurofleetx.model.Location;
import com.neurofleetx.model.Trip;
import com.neurofleetx.model.User;
import com.neurofleetx.model.Vehicle;
import com.neurofleetx.repository.DriverRepository;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner init(UserRepository userRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository, TripRepository tripRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User("admin@neurofleetx.com", passwordEncoder.encode("admin123"), "Admin", "User", "ADMIN"));
                userRepository.save(new User("dispatcher@neurofleetx.com", passwordEncoder.encode("dispatcher123"), "Dispatch", "User", "DISPATCHER"));
                userRepository.save(new User("driver@neurofleetx.com", passwordEncoder.encode("driver123"), "Demo", "Driver", "DRIVER"));
            }

            if (driverRepository.count() == 0) {
                Driver d1 = new Driver();
                d1.setEmail("driver1@example.com"); d1.setFirstName("John"); d1.setLastName("Doe"); d1.setPhoneNumber("+123456789"); d1.setLicenseNumber("D1234"); d1.setStatus("AVAILABLE");
                driverRepository.save(d1);

                Driver d2 = new Driver();
                d2.setEmail("driver2@example.com"); d2.setFirstName("Jane"); d2.setLastName("Smith"); d2.setPhoneNumber("+987654321"); d2.setLicenseNumber("D5678"); d2.setStatus("AVAILABLE");
                driverRepository.save(d2);
            }

            if (vehicleRepository.count() == 0) {
                Vehicle v1 = new Vehicle(); v1.setLicensePlate("ABC-123"); v1.setMake("Toyota"); v1.setModel("Camry"); v1.setYear(2019); v1.setType("SEDAN"); v1.setStatus("AVAILABLE");
                vehicleRepository.save(v1);

                Vehicle v2 = new Vehicle(); v2.setLicensePlate("XYZ-789"); v2.setMake("Honda"); v2.setModel("Civic"); v2.setYear(2020); v2.setType("SEDAN"); v2.setStatus("AVAILABLE");
                vehicleRepository.save(v2);
            }

            if (tripRepository.count() == 0) {
                Trip t = new Trip();
                t.setPassengerId("passenger1");
                t.setPickupLocation(new Location(40.7128, -74.0060, "NYC Pickup"));
                t.setDropoffLocation(new Location(40.730610, -73.935242, "NYC Dropoff"));
                t.setFare(12.50);
                t.setStatus("REQUESTED");
                t.setRequestedTime(Instant.now());
                tripRepository.save(t);
            }
        };
    }
}
