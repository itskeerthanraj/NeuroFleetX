package com.neurofleetx.repository;

import com.neurofleetx.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    List<Vehicle> findByStatus(String status);
    List<Vehicle> findByDriverId(String driverId);
}
