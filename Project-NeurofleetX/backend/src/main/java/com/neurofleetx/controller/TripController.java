package com.neurofleetx.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.neurofleetx.model.Driver;
import com.neurofleetx.model.Trip;
import com.neurofleetx.model.Vehicle;
import com.neurofleetx.repository.DriverRepository;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.VehicleRepository;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin
public class TripController {
    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public List<Trip> all() { return tripRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getById(@PathVariable String id) {
        return tripRepository.findById(id)
                .map(trip -> ResponseEntity.ok(trip))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Trip create(@RequestBody Trip trip) {
        trip.setStatus(trip.getStatus() == null ? "REQUESTED" : trip.getStatus());
        trip.setRequestedTime(Instant.now());
        return tripRepository.save(trip);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable String id, @RequestParam String driverId, @RequestParam String vehicleId) {
        Optional<Trip> t = tripRepository.findById(id);
        if (t.isEmpty()) return ResponseEntity.notFound().build();
        Trip trip = t.get();
        trip.setDriverId(driverId);
        trip.setVehicleId(vehicleId);
        trip.setStatus("ASSIGNED");
        Trip saved = tripRepository.save(trip);

        driverRepository.findById(driverId).ifPresent(d -> { d.setStatus("BUSY"); d.setVehicleId(vehicleId); driverRepository.save(d); });
        vehicleRepository.findById(vehicleId).ifPresent(v -> { v.setStatus("BUSY"); v.setDriverId(driverId); vehicleRepository.save(v); });

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/optimize")
    public ResponseEntity<?> optimize(@PathVariable String id) {
        // Very simple optimizer: pick first available driver and vehicle
        List<Driver> drivers = driverRepository.findByStatus("AVAILABLE");
        List<Vehicle> vehicles = vehicleRepository.findByStatus("AVAILABLE");

        if (drivers.isEmpty() || vehicles.isEmpty()) {
            return ResponseEntity.ok(Map.of());
        }

        String driverId = drivers.get(0).getId();
        String vehicleId = vehicles.get(0).getId();
        return ResponseEntity.ok(Map.of("driverId", driverId, "vehicleId", vehicleId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id) {
        return tripRepository.findById(id).map(trip -> {
            trip.setStatus("CANCELLED");
            Trip saved = tripRepository.save(trip);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/driver/{driverId}")
    public List<Trip> forDriver(@PathVariable String driverId) {
        return tripRepository.findByDriverId(driverId);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> start(@PathVariable String id) {
        return tripRepository.findById(id).map(trip -> {
            trip.setStatus("IN_PROGRESS");
            trip.setStartTime(Instant.now());
            Trip saved = tripRepository.save(trip);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable String id) {
        return tripRepository.findById(id).map(trip -> {
            trip.setStatus("COMPLETED");
            trip.setEndTime(Instant.now());
            Trip saved = tripRepository.save(trip);

            // free driver & vehicle
            if (trip.getDriverId() != null) {
                driverRepository.findById(trip.getDriverId()).ifPresent(d -> { d.setStatus("AVAILABLE"); driverRepository.save(d); });
            }
            if (trip.getVehicleId() != null) {
                vehicleRepository.findById(trip.getVehicleId()).ifPresent(v -> { v.setStatus("AVAILABLE"); vehicleRepository.save(v); });
            }

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
