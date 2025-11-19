package com.neurofleetx.repository;

import com.neurofleetx.model.Trip;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByDriverId(String driverId);
}
