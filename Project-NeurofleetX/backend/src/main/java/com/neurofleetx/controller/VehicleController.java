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

import com.neurofleetx.model.Location;
import com.neurofleetx.model.Vehicle;
import com.neurofleetx.repository.VehicleRepository;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin
public class VehicleController {
    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public List<Vehicle> all() { return vehicleRepository.findAll(); }

    @GetMapping("/available")
    public List<Vehicle> available() { return vehicleRepository.findByStatus("AVAILABLE"); }

    @GetMapping("/driver/{driverId}")
    public List<Vehicle> byDriver(@PathVariable String driverId) { return vehicleRepository.findByDriverId(driverId); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        Optional<Vehicle> v = vehicleRepository.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) { return vehicleRepository.save(vehicle); }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Vehicle update) {
        return vehicleRepository.findById(id).map(v -> {
            v.setLicensePlate(update.getLicensePlate());
            v.setMake(update.getMake());
            v.setModel(update.getModel());
            v.setYear(update.getYear());
            v.setColor(update.getColor());
            v.setType(update.getType());
            v.setStatus(update.getStatus());
            vehicleRepository.save(v);
            return ResponseEntity.ok(v);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        vehicleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable String id,
                                            @RequestParam Double latitude,
                                            @RequestParam Double longitude) {
        return vehicleRepository.findById(id).map(v -> {
            v.setCurrentLocation(new Location(latitude, longitude, null));
            v.setLastUpdated(Instant.now());
            vehicleRepository.save(v);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
