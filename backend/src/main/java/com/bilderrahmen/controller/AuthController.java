package com.bilderrahmen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bilderrahmen.service.AuthService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    public AuthService authService;

    @PostMapping("/registration/{email}")
    public ResponseEntity<String> postRegistration(@PathVariable String email, @RequestBody String password) {
        System.out.println("postRegistration().");

        try {
            boolean exists = authService.checkEmailExists(email);

            if (exists) {
                return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict.
                        .body("Email already registered.");

            } else {

                authService.registerUser(email, password);
                return ResponseEntity.status(HttpStatus.CREATED) // 201 Created.
                        .body("Registration successful");
            }

        } catch (IllegalArgumentException e) { // Specific error.
            System.err.println("postRegistration()_Invalid email: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid email format."); // 400 Bad Request.

        } catch (Exception e) { // General error.
            System.err.println("postRegistration()_Error registering: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed.");
        }
    }

    @PostMapping("/login/{email}")
    public ResponseEntity<Boolean> postLogin(@PathVariable String email, @RequestBody String password) {
        System.out.println("getLogin().");

        try {
            boolean exists = authService.checkEmailExists(email);

            if (exists) {
                return ResponseEntity.ok(true);

            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("getLogin()_Error logging in: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
