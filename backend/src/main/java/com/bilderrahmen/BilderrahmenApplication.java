package com.bilderrahmen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BilderrahmenApplication {
    public static void main(String[] args) {
        SpringApplication.run(BilderrahmenApplication.class, args);
        System.out.println("Hallo Main.");
    }
}
