package com.neurofleetx.repository;

import com.neurofleetx.model.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DriverRepository extends MongoRepository<Driver, String> {
    List<Driver> findByStatus(String status);
}
