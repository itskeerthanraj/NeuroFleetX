package com.neurofleetx.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neurofleetx.model.User;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            return ResponseEntity.status(401).body(error);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            return ResponseEntity.status(401).body(error);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("id", user.getId());
        resp.put("email", user.getEmail());
        resp.put("firstName", user.getFirstName());
        resp.put("lastName", user.getLastName());
        resp.put("role", user.getRole());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String role = body.getOrDefault("role", "DRIVER"); // Default to DRIVER

        // Validate input
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email and password are required");
            return ResponseEntity.status(400).body(error);
        }

        if (firstName == null || firstName.isEmpty() || lastName == null || lastName.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "First name and last name are required");
            return ResponseEntity.status(400).body(error);
        }

        // Check if email already exists
        java.util.Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already registered");
            return ResponseEntity.status(409).body(error);
        }

        // Create new user with encoded password
        User newUser = new User(
            email,
            passwordEncoder.encode(password),
            firstName,
            lastName,
            role
        );

        userRepository.save(newUser);

        // Generate token
        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRole());

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("id", newUser.getId());
        resp.put("email", newUser.getEmail());
        resp.put("firstName", newUser.getFirstName());
        resp.put("lastName", newUser.getLastName());
        resp.put("role", newUser.getRole());

        return ResponseEntity.status(201).body(resp);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            if (auth == null || !auth.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing token");
                return ResponseEntity.status(401).body(error);
            }
            String token = auth.substring(7);
            io.jsonwebtoken.Claims claims = jwtUtil.validateToken(token).getBody();
            String email = claims.getSubject();
            java.util.Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token user");
                return ResponseEntity.status(401).body(error);
            }
            User user = userOpt.get();
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", user.getId());
            resp.put("email", user.getEmail());
            resp.put("firstName", user.getFirstName());
            resp.put("lastName", user.getLastName());
            resp.put("role", user.getRole());
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid token");
            return ResponseEntity.status(401).body(error);
        }
    }
}
