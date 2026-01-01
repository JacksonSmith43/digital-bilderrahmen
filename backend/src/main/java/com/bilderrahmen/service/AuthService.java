package com.bilderrahmen.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bilderrahmen.entity.Auth;
import com.bilderrahmen.repository.AuthRepository;

@Service
public class AuthService {

    @Autowired
    public AuthRepository authRepository;

    public void registerUser(String email, String password) {
        System.out.println("registerUser().");

        try {
            Auth newUser = new Auth(email, password); // This creates a new instance of Auth Entity which essentially
                                                      // creates new rows within the table.

            // save() = INSERT INTO authentication (email, password) VALUES (?, ?). Saves it
            // into the database.
            authRepository.save(newUser);

            System.out.println("User registered successfully: " + email);

        } catch (Exception e) {
            System.err.println("registerUser()_Error registering a user: " + e.getMessage());
        }
    }

    public boolean checkEmailExists(String email) {
        System.out.println("checkEmailExists().");

        try {
            // Equivalent: SELECT * FROM authentication WHERE email = 'birgit@gmail.com'.
            List<Auth> emailExists = authRepository.findByEmail(email);

            if (!emailExists.isEmpty()) { // At least one entry exists.
                System.out.println("checkEmailExists()_Email already exists in the database.");
                return true;

            } else {
                System.out.println("checkEmailExists()_Email has not been taken yet.");
                return false;
            }

        } catch (Exception e) {
            System.err.println("checkEmailExists()_Error checking email: " + e.getMessage());
            return false;
        }
    }

    public boolean login(String email) {
        System.out.println("login().");

        try {
            List<Auth> emailExists = authRepository.findByEmail(email);

            if (!emailExists.isEmpty()) {
                System.out.println("login()_You are being logged in.");
                return true;

            } else {
                System.out.println("login()_Email does not exist.");
                return false;
            }

        } catch (Exception e) {
            System.err.println("login()_Error logging in: " + e.getMessage());
            return false;
        }
    }
}
