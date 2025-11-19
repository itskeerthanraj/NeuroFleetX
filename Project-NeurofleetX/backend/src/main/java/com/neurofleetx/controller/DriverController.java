package com.neurofleetx.controller;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.neurofleetx.model.Driver;
import com.neurofleetx.model.Location;
import com.neurofleetx.repository.DriverRepository;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin
public class DriverController {
    @Autowired
    private DriverRepository driverRepository;

    @GetMapping
    public List<Driver> all() {
        return driverRepository.findAll();
    }

    @GetMapping("/available")
    public List<Driver> available() {
        return driverRepository.findByStatus("AVAILABLE");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        Optional<Driver> d = driverRepository.findById(id);
        return d.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Driver create(@RequestBody Driver driver) {
        driver.setStatus(driver.getStatus() == null ? "AVAILABLE" : driver.getStatus());
        return driverRepository.save(driver);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Driver update) {
        return driverRepository.findById(id).map(d -> {
            d.setEmail(update.getEmail());
            d.setFirstName(update.getFirstName());
            d.setLastName(update.getLastName());
            d.setPhoneNumber(update.getPhoneNumber());
            d.setLicenseNumber(update.getLicenseNumber());
            d.setVehicleId(update.getVehicleId());
            d.setStatus(update.getStatus());
            driverRepository.save(d);
            return ResponseEntity.ok(d);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        driverRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable String id,
                                            @RequestParam Double latitude,
                                            @RequestParam Double longitude) {
        return driverRepository.findById(id).map(d -> {
            d.setCurrentLocation(new Location(latitude, longitude, null));
            d.setLastActive(Instant.now());
            driverRepository.save(d);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
